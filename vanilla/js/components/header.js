// Header Component
function renderHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
        <!-- Top bar -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4">
            <div class="container mx-auto flex justify-between items-center text-sm">
                <div class="flex items-center gap-4">
                    <span class="font-medium">Destek Merkezi</span>
                    <a href="tel:${CONFIG.PHONE.replace(/\s/g, '')}" class="flex items-center gap-2 hover:text-blue-100 transition-colors">
                        ${Utils.getIcon('phone', 16)}
                        <span class="font-semibold">${CONFIG.PHONE}</span>
                    </a>
                </div>
                <button onclick="openLoginModal()" class="hover:text-blue-100 transition-colors cursor-pointer">
                    Giriş Yap
                </button>
            </div>
        </div>

        <!-- Main header -->
        <header class="bg-white shadow-md sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <!-- Logo -->
                    <div class="flex items-center">
                        <a href="#" onclick="Router.linkTo('home'); return false;" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-2xl hover:shadow-lg transition-all duration-300">
                            Velora
                        </a>
                    </div>

                    <!-- Desktop Navigation -->
                    <nav class="hidden md:flex items-center gap-8">
                        <a href="#" onclick="Router.linkTo('products'); return false;" class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            Ürünler
                        </a>
                        <a href="#" onclick="Router.linkTo('voip-crm'); return false;" class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            CRM Panel
                        </a>
                        <a href="#" onclick="Router.linkTo('developers'); return false;" class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            Geliştiriciler
                        </a>
                        <a href="#" onclick="Router.linkTo('partners'); return false;" class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            Partnerler
                        </a>
                        <a href="#" onclick="Router.linkTo('resources'); return false;" class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            Kaynaklar
                        </a>
                        <a href="#" onclick="Router.linkTo('pricing'); return false;" class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                            Fiyatlandırma
                        </a>
                    </nav>

                    <!-- CTA Buttons -->
                    <div class="hidden md:flex items-center gap-4">
                        <button onclick="openContactModal()" class="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-all duration-200">
                            Ekibimizle Görüşün
                        </button>
                        <button onclick="openLoginModal()" class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                            Ücretsiz Başlayın
                        </button>
                    </div>

                    <!-- Mobile menu button -->
                    <button onclick="toggleMobileMenu()" class="md:hidden text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    `;
}

function toggleMobileMenu() {
    // Mobile menu implementation
    Utils.showToast('Mobil menü çok yakında!', 'success');
}