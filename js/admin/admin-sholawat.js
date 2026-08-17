document.addEventListener('DOMContentLoaded', async () => {
    const auth = new window.AdminAuth();
    const sholawatList = document.getElementById('sholawatList');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('[data-filter]');
    const addButton = document.getElementById('openAddModal');
    const sholawatModalEl = document.getElementById('sholawatModal');
    const sholawatForm = document.getElementById('sholawatForm');
    const modalTitle = document.getElementById('sholawatModalLabel');
    const saveButton = document.getElementById('saveSholawatBtn');
    const statusFieldWrap = document.getElementById('statusFieldWrap');
    const statusField = document.getElementById('statusField');
    const pageAlert = document.getElementById('pageAlert');

    if (!sholawatList || !sholawatForm) return;

    const state = {
        items: [],
        filter: 'all',
        search: '',
        activeEditId: null
    };

    const modal = sholawatModalEl ? new bootstrap.Modal(sholawatModalEl) : null;

    const showAlert = (message, type = 'success') => {
        if (!pageAlert) return;
        pageAlert.className = `alert alert-${type} mt-3`;
        pageAlert.textContent = message;
        pageAlert.classList.remove('d-none');
    };

    const hideAlert = () => {
        if (!pageAlert) return;
        pageAlert.classList.add('d-none');
        pageAlert.textContent = '';
    };

    const redirectToLogin = () => {
        window.location.href = 'login.html';
    };

    const normalizeStatus = (value) => {
        const normalized = String(value || '').toLowerCase();
        if (['nonaktif', 'inactive', 'deleted', 'soft-deleted'].includes(normalized)) {
            return 'nonaktif';
        }
        return 'aktif';
    };

    const withToken = async (callback) => {
        const token = auth.getToken();
        if (!token) {
            redirectToLogin();
            return null;
        }

        return callback(token);
    };

    const updateDashboardStats = (items) => {
        const totalAktifEl = document.getElementById('totalAktif');
        const totalNonaktifEl = document.getElementById('totalNonaktif');
        const totalSholawatEl = document.getElementById('totalSholawat');

        if (!items || !items.length) {
            if (totalAktifEl) totalAktifEl.textContent = '0';
            if (totalNonaktifEl) totalNonaktifEl.textContent = 'N/A';
            if (totalSholawatEl) totalSholawatEl.textContent = '0';
            return;
        }

        const activeCount = items.filter((item) => normalizeStatus(item.status) !== 'nonaktif').length;
        const inactiveCount = items.filter((item) => normalizeStatus(item.status) === 'nonaktif').length;
        const hasExplicitInactiveData = items.some((item) => Object.prototype.hasOwnProperty.call(item, 'status'));

        if (totalAktifEl) totalAktifEl.textContent = String(activeCount);
        if (totalNonaktifEl) totalNonaktifEl.textContent = hasExplicitInactiveData ? String(inactiveCount) : 'N/A';
        if (totalSholawatEl) totalSholawatEl.textContent = String(items.length);
    };

    const loadSholawat = async () => {
        hideAlert();

        const result = await withToken(async (token) => {
            const response = await window.AdminApi.apiGet('getSholawat', {});
            return response;
        });

        if (!result || !result.success) {
            return;
        }

        const data = Array.isArray(result.data) ? result.data : [];
        state.items = data.map((item) => ({
            ...item,
            status: normalizeStatus(item.status)
        }));

        updateDashboardStats(state.items);
        renderList();
    };

    const setFormMode = (mode) => {
        if (!modalTitle) return;
        if (mode === 'edit') {
            modalTitle.textContent = 'Edit Sholawat';
            if (statusFieldWrap) statusFieldWrap.style.display = 'block';
            if (saveButton) saveButton.textContent = 'Simpan Perubahan';
        } else {
            modalTitle.textContent = 'Tambah Sholawat';
            if (statusFieldWrap) statusFieldWrap.style.display = 'none';
            if (saveButton) saveButton.textContent = 'Simpan';
        }
    };

    const openAddModal = () => {
        state.activeEditId = null;
        sholawatForm.reset();
        if (statusField) statusField.value = 'aktif';
        setFormMode('add');
        if (modal) modal.show();
    };

    const openEditModal = (item) => {
        state.activeEditId = item.id;
        sholawatForm.reset();
        if (statusField) statusField.value = normalizeStatus(item.status);
        const formFields = {
            judul: item.judul || '',
            teks_arab: item.teks_arab || '',
            teks_latin: item.teks_latin || '',
            terjemahan: item.terjemahan || '',
            audio_file_id: item.audio_file_id || item.audio_url || ''
        };

        Object.entries(formFields).forEach(([key, value]) => {
            const field = sholawatForm.elements.namedItem(key);
            if (field) {
                field.value = value;
            }
        });

        setFormMode('edit');
        if (modal) modal.hide();
        if (modal) modal.show();
    };

    const renderList = () => {
        const filteredItems = state.items.filter((item) => {
            const matchFilter = state.filter === 'all' || normalizeStatus(item.status) === state.filter;
            const q = state.search.trim().toLowerCase();
            const matchSearch = !q || (item.judul || '').toLowerCase().includes(q);
            return matchFilter && matchSearch;
        });

        if (!filteredItems.length) {
            sholawatList.innerHTML = '<div class="empty-state">Tidak ada sholawat yang sesuai dengan filter atau pencarian.</div>';
            return;
        }

        sholawatList.innerHTML = filteredItems.map((item, index) => {
            const title = item.judul || 'Judul tidak tersedia';
            const status = normalizeStatus(item.status);
            const actionText = status === 'nonaktif' ? 'Aktifkan Kembali' : 'Nonaktifkan';
            const actionClass = status === 'nonaktif' ? 'success' : 'danger';
            const itemOrder = item.urutan || index + 1;

            return `
        <div class="sholawat-card" draggable="true" data-id="${item.id}">
          <div class="drag-handle" aria-label="Drag handle">☰</div>
          <div class="sholawat-ordinal">${String(itemOrder).padStart(2, '0')}</div>
          <div class="sholawat-meta">
            <h4>${title}</h4>
            <span class="sholawat-status ${status}">${status === 'nonaktif' ? 'Nonaktif' : 'Aktif'}</span>
          </div>
          <div class="sholawat-actions">
            <button type="button" class="btn-action" data-action="edit" data-id="${item.id}">Edit</button>
            <button type="button" class="btn-action ${actionClass}" data-action="toggle" data-id="${item.id}">${actionText}</button>
          </div>
        </div>
      `;
        }).join('');

        sholawatList.querySelectorAll('.sholawat-card').forEach((card) => {
            const itemId = card.dataset.id;

            card.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', itemId);
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            card.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            card.addEventListener('drop', (event) => {
                event.preventDefault();
                const fromId = event.dataTransfer.getData('text/plain');
                if (!fromId || fromId === itemId) return;
                moveItemInList(fromId, itemId);
            });
        });
    };

    const moveItemInList = (fromId, targetId) => {
        const currentIndex = state.items.findIndex((item) => item.id === fromId);
        const targetIndex = state.items.findIndex((item) => item.id === targetId);
        if (currentIndex < 0 || targetIndex < 0) return;

        const nextItems = [...state.items];
        const [movedItem] = nextItems.splice(currentIndex, 1);
        nextItems.splice(targetIndex, 0, movedItem);

        state.items = nextItems.map((item, index) => ({
            ...item,
            urutan: index + 1,
            status: normalizeStatus(item.status)
        }));

        renderList();
        updateDashboardStats(state.items);
    };

    const saveOrder = async () => {
        const token = auth.getToken();
        if (!token) {
            redirectToLogin();
            return;
        }

        const payload = {
            action: 'reorderSholawat',
            token,
            items: state.items.map((item, index) => ({
                id: item.id,
                urutan: index + 1
            }))
        };

        try {
            const result = await window.AdminApi.apiPost(payload);
            if (!result || !result.success) {
                throw new Error(result && result.message ? result.message : 'Gagal menyimpan urutan sholawat.');
            }
            showAlert('Urutan sholawat berhasil disimpan.', 'success');
            await loadSholawat();
        } catch (error) {
            const message = window.AdminApi.handleApiError(error, () => {
                auth.clearSession();
                redirectToLogin();
            });
            showAlert(message || 'Gagal menyimpan urutan sholawat.', 'danger');
        }
    };

    const saveSholawat = async (event) => {
        event.preventDefault();

        const formData = new FormData(sholawatForm);
        const judul = String(formData.get('judul') || '').trim();
        if (!judul) {
            showAlert('Judul sholawat wajib diisi.', 'danger');
            return;
        }

        const payload = {
            judul,
            teks_arab: String(formData.get('teks_arab') || '').trim(),
            teks_latin: String(formData.get('teks_latin') || '').trim(),
            terjemahan: String(formData.get('terjemahan') || '').trim(),
            audio_file_id: String(formData.get('audio_file_id') || '').trim()
        };

        const token = auth.getToken();
        if (!token) {
            redirectToLogin();
            return;
        }

        try {
            if (state.activeEditId) {
                const existingItem = state.items.find((item) => item.id === state.activeEditId) || {};
                const updatePayload = {
                    action: 'updateSholawat',
                    token,
                    id: state.activeEditId,
                    ...payload,
                    status: (statusField ? statusField.value : 'aktif') || normalizeStatus(existingItem.status)
                };

                const result = await window.AdminApi.apiPost(updatePayload);
                if (!result || !result.success) {
                    throw new Error(result && result.message ? result.message : 'Gagal memperbarui sholawat.');
                }
                showAlert('Sholawat berhasil diperbarui.', 'success');
            } else {
                const addPayload = {
                    action: 'addSholawat',
                    token,
                    ...payload
                };

                const result = await window.AdminApi.apiPost(addPayload);
                if (!result || !result.success) {
                    throw new Error(result && result.message ? result.message : 'Gagal menambahkan sholawat.');
                }
                showAlert('Sholawat berhasil ditambahkan.', 'success');
            }

            if (modal) modal.hide();
            sholawatForm.reset();
            state.activeEditId = null;
            await loadSholawat();
        } catch (error) {
            const message = window.AdminApi.handleApiError(error, () => {
                auth.clearSession();
                redirectToLogin();
            });
            showAlert(message || 'Gagal menyimpan sholawat.', 'danger');
        }
    };

    const toggleSholawatStatus = async (itemId) => {
        const item = state.items.find((entry) => entry.id === itemId);
        if (!item) return;

        const action = normalizeStatus(item.status) === 'nonaktif' ? 'restoreSholawat' : 'deleteSholawat';
        const confirmText = normalizeStatus(item.status) === 'nonaktif'
            ? 'Apakah Anda yakin ingin mengaktifkan kembali sholawat ini?'
            : 'Apakah Anda yakin ingin menonaktifkan sholawat ini?';

        if (!window.confirm(confirmText)) return;

        const token = auth.getToken();
        if (!token) {
            redirectToLogin();
            return;
        }

        try {
            const result = await window.AdminApi.apiPost({
                action,
                token,
                id: itemId
            });

            if (!result || !result.success) {
                throw new Error(result && result.message ? result.message : 'Gagal memperbarui status sholawat.');
            }

            showAlert(normalizeStatus(item.status) === 'nonaktif' ? 'Sholawat berhasil diaktifkan kembali.' : 'Sholawat berhasil dinonaktifkan.', 'success');
            await loadSholawat();
        } catch (error) {
            const message = window.AdminApi.handleApiError(error, () => {
                auth.clearSession();
                redirectToLogin();
            });
            showAlert(message || 'Gagal memperbarui status sholawat.', 'danger');
        }
    };

    sholawatForm.addEventListener('submit', saveSholawat);

    addButton && addButton.addEventListener('click', openAddModal);

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((item) => item.classList.toggle('active', item === button));
            state.filter = button.dataset.filter || 'all';
            renderList();
        });
    });

    searchInput && searchInput.addEventListener('input', (event) => {
        state.search = event.target.value;
        renderList();
    });

    document.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;

        const { action, id } = actionButton.dataset;
        const item = state.items.find((entry) => entry.id === id);

        if (!item) return;

        if (action === 'edit') {
            openEditModal(item);
            return;
        }

        if (action === 'toggle') {
            toggleSholawatStatus(id);
        }
    });

    const saveOrderButton = document.createElement('button');
    saveOrderButton.type = 'button';
    saveOrderButton.className = 'btn-adiba secondary mt-3';
    saveOrderButton.textContent = 'Simpan Urutan';
    saveOrderButton.addEventListener('click', saveOrder);
    sholawatList.parentNode.appendChild(saveOrderButton);

    try {
        const result = await window.AdminApi.apiGet('getSholawat');
        if (!result || !result.success) {
            showAlert('Data sholawat tidak dapat dimuat.', 'danger');
            return;
        }
        state.items = Array.isArray(result.data) ? result.data.map((item) => ({ ...item, status: normalizeStatus(item.status) })) : [];
        updateDashboardStats(state.items);
        renderList();
    } catch (error) {
        const message = window.AdminApi.handleApiError(error, () => {
            auth.clearSession();
            redirectToLogin();
        });
        showAlert(message || 'Gagal memuat data sholawat.', 'danger');
    }
});
