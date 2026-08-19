(function () {
    const loadingElement = document.getElementById('sholawat-loading');
    const contentElement = document.getElementById('sholawat-content');
    const sidebarElement = document.querySelector('.sidebar-nav');
    const config = window.ADIBA_CONFIG || {};

    let supabaseClient = null;

    function initSupabase() {
        if (supabaseClient) return supabaseClient;

        if (!window.supabase || !config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
            console.error('[Supabase] URL atau ANON key belum dikonfigurasi.');
            return null;
        }

        supabaseClient = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        return supabaseClient;
    }

    function setLoading(isLoading) {
        if (!loadingElement) return;
        loadingElement.classList.toggle('d-none', !isLoading);
    }

    function showMessage(message, type) {
        if (!contentElement) return;
        contentElement.innerHTML = `<div class="content-section bg-light"><div class="container px-4 px-lg-5"><div class="alert alert-${type} text-center mb-0" role="alert">${message}</div></div></div>`;
    }

    function appendTextWithBreaks(element, value) {
        String(value || '').split(/\r?\n/).forEach((line, index, lines) => {
            element.appendChild(document.createTextNode(line));
            if (index < lines.length - 1) element.appendChild(document.createElement('br'));
        });
    }

    function renderAudioPlayer(audioUrl) {
        const wrapper = document.createElement('div');
        wrapper.className = 'mt-4';

        if (!audioUrl) {
            wrapper.classList.add('text-muted', 'small');
            wrapper.textContent = 'Audio belum tersedia';
            return wrapper;
        }

        const audio = document.createElement('audio');
        audio.className = 'w-100';
        audio.controls = true;
        audio.preload = 'none';
        audio.src = audioUrl;
        audio.addEventListener('error', () => console.error('[Audio] Gagal memuat audio:', audioUrl));
        wrapper.appendChild(audio);
        return wrapper;
    }

    function renderSholawatItem(item) {
        const section = document.createElement('section');
        section.className = 'content-section bg-light';
        section.id = String(item.urutan);

        const container = document.createElement('div');
        container.className = 'container px-4 px-lg-5 text-center';
        const row = document.createElement('div');
        row.className = 'row gx-4 gx-lg-5 justify-content-center';

        const title = document.createElement('div');
        title.className = 'font_label';
        appendTextWithBreaks(title, item.judul);

        const arabic = document.createElement('div');
        arabic.className = 'font_isi';
        appendTextWithBreaks(arabic, item.teks_arab);

        const latin = document.createElement('div');
        latin.className = 'font_latin mt-3';
        appendTextWithBreaks(latin, item.teks_latin);

        const translation = document.createElement('div');
        translation.className = 'font_terjemahan mt-3';
        appendTextWithBreaks(translation, item.terjemahan);

        row.append(title, arabic, latin, translation, renderAudioPlayer(item.audio_url));
        container.appendChild(row);
        section.appendChild(container);
        return section;
    }

    function renderSidebar(items) {
        if (!sidebarElement) return;
        const brand = sidebarElement.querySelector('.sidebar-brand');
        sidebarElement.replaceChildren(brand || document.createElement('li'));

        items.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.className = 'sidebar-nav-item';
            const link = document.createElement('a');
            link.href = `#${item.urutan}`;
            link.textContent = `${String(item.urutan).padStart(2, '0')}. ${item.judul}`;
            listItem.appendChild(link);
            sidebarElement.appendChild(listItem);
        });

        const adminItem = document.createElement('li');
        adminItem.className = 'sidebar-nav-item admin-access';
        const adminLink = document.createElement('a');
        adminLink.href = 'admin/login.html';
        adminLink.innerHTML = '<i class="fas fa-user-shield me-2" aria-hidden="true"></i>Pengelola';
        adminItem.appendChild(adminLink);
        sidebarElement.appendChild(adminItem);
    }

    function renderSholawat(items) {
        if (!contentElement) return;
        contentElement.replaceChildren(...items.map(renderSholawatItem));
        renderSidebar(items);
    }

    async function loadSholawat() {
        const client = initSupabase();
        if (!client) {
            showMessage('Gagal memuat data Sholawat. Silakan coba lagi.', 'danger');
            return;
        }

        const { data, error } = await client
            .from('sholawat')
            .select('id, urutan, judul, teks_arab, teks_latin, terjemahan, audio_url, status')
            .eq('status', true)
            .order('urutan', { ascending: true });

        if (error) {
            console.error('[Supabase] [Sholawat] Gagal mengambil data:', error);
            showMessage('Gagal memuat data Sholawat. Silakan coba lagi.', 'danger');
            return;
        }

        if (!data || data.length === 0) {
            showMessage('Belum ada Sholawat.', 'info');
            renderSidebar([]);
            return;
        }

        renderSholawat(data);
    }

    async function refreshSholawat() {
        setLoading(true);
        if (contentElement) contentElement.replaceChildren();
        await loadSholawat();
        setLoading(false);
    }

    window.initSupabase = initSupabase;
    window.loadSholawat = loadSholawat;
    window.renderSholawat = renderSholawat;
    window.renderSholawatItem = renderSholawatItem;
    window.renderAudioPlayer = renderAudioPlayer;
    window.refreshSholawat = refreshSholawat;

    if (contentElement) {
        document.querySelectorAll('section[id]').forEach((section) => section.remove());
        renderSidebar([]);
        refreshSholawat();
    }
})();