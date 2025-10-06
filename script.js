// Store the map instance globally or within the scope
let mapInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // --- 0. THEME TOGGLE LOGIC ---
    const body = document.body;
    const themeToggleHeader = document.getElementById('theme-toggle-header');
    const themeToggleSidebar = document.getElementById('theme-toggle-sidebar');

    const savedTheme = localStorage.getItem('savyours-theme') || 'dark-mode';
    body.classList.remove('dark-mode', 'light-mode');
    body.classList.add(savedTheme);
    updateThemeToggleIcons(savedTheme);

    function updateThemeToggleIcons(currentTheme) {
        if (currentTheme === 'dark-mode') {
            themeToggleHeader.textContent = 'dark_mode';
            themeToggleSidebar.innerHTML = 'Dark Mode <span class="material-icons theme-icon">dark_mode</span>';
        } else {
            themeToggleHeader.textContent = 'light_mode';
            themeToggleSidebar.innerHTML = 'Light Mode <span class="material-icons theme-icon">light_mode</span>';
        }
    }

    function toggleTheme() {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('savyours-theme', 'light-mode');
            updateThemeToggleIcons('light-mode');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('savyours-theme', 'dark-mode');
            updateThemeToggleIcons('dark-mode');
        }
    }

    themeToggleHeader.addEventListener('click', toggleTheme);
    if (themeToggleSidebar) {
        themeToggleSidebar.addEventListener('click', (e) => {
            e.preventDefault(); 
            toggleTheme();
        });
    }


    // --- 1. NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll('#bottom-nav .nav-item');
    const appScreens = document.querySelectorAll('.app-screen');

    navItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();

            // Deactivate all screens and nav items
            appScreens.forEach(screen => screen.classList.remove('active-screen'));
            navItems.forEach(nav => nav.classList.remove('active'));

            // Activate the selected screen and nav item
            const targetId = this.getAttribute('data-target');
            const targetScreen = document.getElementById(`screen-${targetId}`);
            if (targetScreen) {
                 targetScreen.classList.add('active-screen');
            }
            this.classList.add('active');

            closeNav(); 

            // Special handling for the map screen
            if (targetId === 'map') {
                // Delay map initialization/invalidation to ensure the container is visible
                setTimeout(initializeLeafletMap, 100); 
            }
        });
    });

    // --- 2. HAMBURGER MENU (SIDEBAR) LOGIC ---
    window.openNav = function() {
        document.getElementById("sidebar-menu").style.width = "280px";
    }

    window.closeNav = function() {
        document.getElementById("sidebar-menu").style.width = "0";
    }


    // --- 3. BRUNEI-SPECIFIC FEATURE: SHOLAT TIME LOGIC (Mock Data) ---
    const sholatTimes = [
        // Prayer times are approximate for Brunei/BSB
        { name: "Fajr", time: "04:51" },
        { name: "Sunrise", time: "06:08" },
        { name: "Dhuhr", time: "12:10" },
        { name: "Asar", time: "15:23" }, 
        { name: "Maghrib", time: "18:12" }, 
        { name: "Isha", time: "19:21" }  
    ];

    function updateSholatTime() {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        let nextPrayer = null;

        for (const prayer of sholatTimes) {
            const [hour, minute] = prayer.time.split(':').map(Number);
            const prayerMinutes = hour * 60 + minute;

            if (prayerMinutes > nowMinutes) {
                nextPrayer = prayer;
                break;
            }
        }

        const sholatElement = document.getElementById('next-sholat');
        if (sholatElement) {
            if (nextPrayer) {
                const [hour, minute] = nextPrayer.time.split(':');
                const displayTime = new Date(0, 0, 0, hour, minute).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });
                sholatElement.textContent = `Next: ${nextPrayer.name} at ${displayTime}`;
            } else {
                const [fajrHour, fajrMinute] = sholatTimes[0].time.split(':').map(Number);
                const fajrDisplayTime = new Date(0, 0, 0, fajrHour, fajrMinute).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });
                sholatElement.textContent = `Next: Fajr Tomorrow at ${fajrDisplayTime}`;
            }
        }
    }

    updateSholatTime();
    setInterval(updateSholatTime, 60000);


    // --- 4. ORDERS SCREEN: VOUCHER LOGIC ---
    window.applyVoucher = function() {
        const input = document.getElementById('voucher-input');
        const status = document.querySelector('.voucher-status');
        const voucherCode = input.value.trim().toUpperCase();

        status.classList.remove('success');
        status.textContent = ''; 

        if (voucherCode === 'SAVEYOUR5') {
            status.textContent = '✅ Voucher "SAVEYOUR5" applied! BND 5.00 discount confirmed.';
            status.classList.add('success');
        } else if (voucherCode) {
            status.textContent = `❌ Error: Voucher "${voucherCode}" is invalid or expired.`;
            status.classList.remove('success');
        } else {
            status.textContent = `Please enter a voucher code to proceed.`;
            status.classList.remove('success');
        }
    }


    // --- 5. LEAFLET MAP INTEGRATION LOGIC (Full Map Screen) ---
    
    // Store Data (Coordinates approximate locations near BSB, Brunei)
    const storeData = [
        {  
            name: 'Comfort Greens Cafe (Gadong)', 
            lat: 4.9200, 
            lon: 114.9200, 
            status: '2 Bags Left',
            price: 'BND 7.00',
            isSoldOut: false
        },
        {  
            name: 'The Little Leaf Bakery (Kiulap)', 
            lat: 4.9090, 
            lon: 114.9350, 
            status: 'Sold Out',
            price: 'BND 9.00',
            isSoldOut: true
        },
        {  
            name: 'Pepper Lunch (Airport Mall)', 
            lat: 4.9490, 
            lon: 114.9250, 
            status: '5 Bags Left',
            price: 'BND 8.00',
            isSoldOut: false
        },
        {  
            name: 'Taste of Brunei Bakeries', 
            lat: 4.9400, 
            lon: 114.9450, 
            status: '1 Bag Left',
            price: 'BND 8.00',
            isSoldOut: false
        }
    ];

    function initializeLeafletMap() {
        const mapElementId = 'interactive-map-full';
        const mapElement = document.getElementById(mapElementId);
        
        // Only initialize if the map is not already initialized
        if (mapElement && !mapInstance) {
            // 1. Map Initialization (Centered near Bandar Seri Begawan)
            mapInstance = L.map(mapElementId).setView([4.9450, 114.9427], 13);

            // 2. Add the Tile Layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapInstance);

            // 3. Custom Icon for Active Bags
            var activeBagIcon = L.divIcon({
                className: 'map-icon-active',
                html: '<div style="width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px #333;"><i class="fas fa-shopping-bag" style="color: white; font-size: 14px;"></i></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -25]
            });

            // 4. Custom Icon for Sold Out Bags
            var soldOutBagIcon = L.divIcon({
                className: 'map-icon-soldout',
                html: '<div style="width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; border: 3px solid white; opacity: 0.8; box-shadow: 0 0 5px #333;"><i class="fas fa-times-circle" style="color: white; font-size: 14px;"></i></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -25]
            });

            // 5. Add Markers dynamically
            storeData.forEach(store => {
                const icon = store.isSoldOut ? soldOutBagIcon : activeBagIcon;
                const popupContent = `
                    <b>${store.name}</b><br>
                    <span style="color: ${store.isSoldOut ? 'var(--color-sold-out)' : 'var(--color-accent)'}; font-weight: bold;">${store.status}</span><br>
                    Price: ${store.price}
                    <hr style="margin: 5px 0;">
                    ${store.isSoldOut ? '<span>Check back tomorrow.</span>' : '<a href="javascript:void(0)" onclick="alert(\'Reserved 1 bag!\')">Reserve Now!</a>'}
                `;

                L.marker([store.lat, store.lon], { icon: icon }).addTo(mapInstance)
                    .bindPopup(popupContent);
            });

            // 6. User Location (Simulated)
            L.circle([4.9450, 114.9427], {
                color: 'blue',
                fillColor: '#30a4ff',
                fillOpacity: 0.5,
                radius: 300 
            }).addTo(mapInstance).bindPopup("Your Location (Bandar Seri Begawan)");
        } 
        
        // If the map exists, invalidate size to ensure it renders correctly after visibility change
        if (mapInstance) {
            mapInstance.invalidateSize();
        }
    }


    // --- INITIALIZATION ---
    document.getElementById('screen-discover').classList.add('active-screen');
});
</script>
