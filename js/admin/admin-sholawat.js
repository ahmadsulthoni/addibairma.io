document.addEventListener('DOMContentLoaded', async () => {
    const auth = new window.AdminAuth();
    const client = window.initSupabase ? window.initSupabase() : null;
    const sholawatList = document.getElementById('sholawatList');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('[data-filter]');
    const addButton = document.getElementById('openAddModal');
    const modalElement = document.getElementById('sholawatModal');
    const form = document.getElementById('sholawatForm');
    const modalTitle = document.getElementById('sholawatModalLabel');
    const saveButton = document.getElementById('saveSholawatBtn');
    const statusFieldWrap = document.getElementById('statusFieldWrap');
    const statusField = document.getElementById('statusField');
    const pageAlert = document.getElementById('pageAlert');

    if (!client || !sholawatList || !form) return;

    const state = { items: [], filter: 'all', search: '', activeEditId: null };
    const modal = modalElement ? new bootstrap.Modal(modalElement) : null;

    const showAlert = (message, type = 'success') => {
        if (!pageAlert) return;
        pageAlert.className = `alert alert-${type} mt-3`;
        pageAlert.textContent = message;
        pageAlert.classList.remove('d-none');
    };

    const normalizeStatus = (value) => value === true || value === 'true' || value === 'aktif';
    const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));

    const updateStats = (items) => {
        const activeCount = items.filter((item) => normalizeStatus(item.status)).length;
        const active = document.getElementById('totalAktif');
        const inactive = document.getElementById('totalNonaktif');
        const total = document.getElementById('totalSholawat');
        if (active) active.textContent = String(activeCount);
        if (inactive) inactive.textContent = String(items.length - activeCount);
        if (total) total.textContent = String(items.length);
    };

    const setButtonLoading = (button, loading, loadingText, idleText) => {
        if (!button) return;
        button.disabled = loading;
        button.textContent = loading ? loadingText : idleText;
    };

    const loadSholawat = async () => {
        const { data, error } = await client
            .from('sholawat')
            .select('id, urutan, judul, teks_arab, teks_latin, terjemahan, audio_url, status, created_at, updated_at')
            .order('urutan', { ascending: true });

        if (error) {
            console.error('[Supabase] [Admin] Gagal memuat Sholawat:', error);
            showAlert('Gagal memuat data Sholawat.', 'danger');
            return;
        }

        state.items = Array.isArray(data) ? data : [];
        updateStats(state.items);
        renderList();
    };

    const renderList = () => {
        const query = state.search.trim().toLowerCase();
        const items = state.items.filter((item) => {
            const status = normalizeStatus(item.status) ? 'aktif' : 'nonaktif';
            return (state.filter === 'all' || status === state.filter)
                && (!query || String(item.judul || '').toLowerCase().includes(query));
        });

        if (!items.length) {
            sholawatList.innerHTML = '<div class="empty-state">Tidak ada sholawat yang sesuai dengan filter atau pencarian.</div>';
            return;
        }

        sholawatList.innerHTML = items.map((item) => {
            const active = normalizeStatus(item.status);
            const status = active ? 'aktif' : 'nonaktif';
            return `<div class="sholawat-card" draggable="true" data-id="${escapeHtml(item.id)}">
                <div class="drag-handle" aria-label="Drag handle">☰</div>
                <div class="sholawat-ordinal">${String(item.urutan || 0).padStart(2, '0')}</div>
                <div class="sholawat-meta"><h4>${escapeHtml(item.judul || 'Judul tidak tersedia')}</h4>
                    <span class="sholawat-status ${status}">${active ? 'Aktif' : 'Nonaktif'}</span></div>
                <div class="sholawat-actions">
                    <button type="button" class="btn-action" data-action="edit" data-id="${escapeHtml(item.id)}">Edit</button>
                    <button type="button" class="btn-action ${active ? 'danger' : 'success'}" data-action="toggle" data-id="${escapeHtml(item.id)}">${active ? 'Nonaktifkan' : 'Aktifkan Kembali'}</button>
                </div>
            </div>`;
        }).join('');

        sholawatList.querySelectorAll('.sholawat-card').forEach((card) => {
            card.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', card.dataset.id);
                card.classList.add('dragging');
            });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
            card.addEventListener('dragover', (event) => event.preventDefault());
            card.addEventListener('drop', (event) => {
                event.preventDefault();
                moveItem(event.dataTransfer.getData('text/plain'), card.dataset.id);
            });
        });
    };

    const moveItem = (fromId, targetId) => {
        const fromIndex = state.items.findIndex((item) => item.id === fromId);
        const targetIndex = state.items.findIndex((item) => item.id === targetId);
        if (fromIndex < 0 || targetIndex < 0 || fromId === targetId) return;
        const nextItems = [...state.items];
        const [moved] = nextItems.splice(fromIndex, 1);
        nextItems.splice(targetIndex, 0, moved);
        state.items = nextItems.map((item, index) => ({ ...item, urutan: index + 1 }));
        renderList();
        updateStats(state.items);
    };

    const saveOrder = async (button) => {
        setButtonLoading(button, true, 'Menyimpan...', 'Simpan Urutan');
        try {
            const results = await Promise.all(state.items.map((item, index) =>
                client.from('sholawat').update({ urutan: index + 1 }).eq('id', item.id)
            ));
            const failed = results.find((result) => result.error);
            if (failed) throw failed.error;
            showAlert('Urutan Sholawat berhasil diperbarui.', 'success');
            await loadSholawat();
        } catch (error) {
            console.error('[Supabase] [Admin] Gagal menyimpan urutan:', error);
            showAlert('Gagal menyimpan urutan Sholawat.', 'danger');
        } finally {
            setButtonLoading(button, false, 'Menyimpan...', 'Simpan Urutan');
        }
    };

    const setFormMode = (editing) => {
        if (modalTitle) modalTitle.textContent = editing ? 'Edit Sholawat' : 'Tambah Sholawat';
        if (statusFieldWrap) statusFieldWrap.style.display = editing ? 'block' : 'none';
        if (saveButton) saveButton.textContent = editing ? 'Simpan Perubahan' : 'Simpan';
    };

    const openAddModal = () => {
        state.activeEditId = null;
        form.reset();
        if (statusField) statusField.value = 'aktif';
        setFormMode(false);
        if (modal) modal.show();
    };

    const openEditModal = (item) => {
        state.activeEditId = item.id;
        form.reset();
        const values = {
            judul: item.judul || '',
            teks_arab: item.teks_arab || '',
            teks_latin: item.teks_latin || '',
            terjemahan: item.terjemahan || '',
            audio_file_id: item.audio_url || ''
        };
        Object.entries(values).forEach(([name, value]) => {
            const field = form.elements.namedItem(name);
            if (field) field.value = value;
        });
        if (statusField) statusField.value = normalizeStatus(item.status) ? 'aktif' : 'nonaktif';
        setFormMode(true);
        if (modal) modal.show();
    };

    const saveSholawat = async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
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
            audio_url: String(formData.get('audio_file_id') || '').trim(),
            status: statusField ? statusField.value === 'aktif' : true
        };
        const idleText = state.activeEditId ? 'Simpan Perubahan' : 'Simpan';
        setButtonLoading(saveButton, true, 'Menyimpan...', idleText);

        try {
            if (state.activeEditId) {
                const { error } = await client.from('sholawat').update(payload).eq('id', state.activeEditId);
                if (error) throw error;
                showAlert('Sholawat berhasil diperbarui.', 'success');
            } else {
                const nextOrder = state.items.reduce((max, item) => Math.max(max, Number(item.urutan) || 0), 0) + 1;
                const { error } = await client.from('sholawat').insert({ ...payload, urutan: nextOrder });
                if (error) throw error;
                showAlert('Sholawat berhasil ditambahkan.', 'success');
            }
            if (modal) modal.hide();
            form.reset();
            state.activeEditId = null;
            await loadSholawat();
        } catch (error) {
            console.error('[Supabase] [Admin] Gagal menyimpan Sholawat:', error);
            showAlert('Gagal menyimpan Sholawat. Silakan periksa koneksi internet.', 'danger');
        } finally {
            setButtonLoading(saveButton, false, 'Menyimpan...', idleText);
        }
    };

    const toggleStatus = async (item) => {
        const active = normalizeStatus(item.status);
        const message = active
            ? 'Hapus Sholawat? Sholawat akan disembunyikan dari daftar utama.'
            : 'Aktifkan kembali Sholawat ini?';
        if (!window.confirm(message)) return;

        try {
            const { error } = await client.from('sholawat').update({ status: !active }).eq('id', item.id);
            if (error) throw error;
            showAlert(active ? 'Sholawat berhasil dinonaktifkan.' : 'Sholawat berhasil diaktifkan kembali.', 'success');
            await loadSholawat();
        } catch (error) {
            console.error('[Supabase] [Admin] Gagal mengubah status:', error);
            showAlert('Gagal memperbarui status Sholawat.', 'danger');
        }
    };

    form.addEventListener('submit', saveSholawat);
    if (addButton) addButton.addEventListener('click', openAddModal);
    filterButtons.forEach((button) => button.addEventListener('click', () => {
        filterButtons.forEach((item) => item.classList.toggle('active', item === button));
        state.filter = button.dataset.filter || 'all';
        renderList();
    }));
    if (searchInput) searchInput.addEventListener('input', (event) => {
        state.search = event.target.value;
        renderList();
    });
    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const item = state.items.find((entry) => entry.id === button.dataset.id);
        if (!item) return;
        if (button.dataset.action === 'edit') openEditModal(item);
        if (button.dataset.action === 'toggle') toggleStatus(item);
    });

    const orderButton = document.createElement('button');
    orderButton.type = 'button';
    orderButton.className = 'btn-adiba secondary mt-3';
    orderButton.textContent = 'Simpan Urutan';
    orderButton.addEventListener('click', () => saveOrder(orderButton));
    sholawatList.parentNode.appendChild(orderButton);

    const session = await auth.checkSession();
    if (session.success) await loadSholawat();
});
