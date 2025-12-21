// Footer Component
function renderFooter() {
    const footer = document.getElementById('footer');
    const currentYear = new Date().getFullYear();
    
    footer.innerHTML = `
        <footer class="bg-gray-900 text-gray-300">
            <div class="container mx-auto px-4 py-16">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
                    <!-- Logo and Description -->
                    <div class="lg:col-span-2">
                        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-2xl inline-block mb-4">
                            Velora
                        </div>
                        <p class="text-gray-400 mb-6 leading-relaxed">
                            Türkiye'nin önde gelen telekom operatörü. Bulut santral, SMS ve sabit telefon çözümleriyle işletmenize güç katıyoruz.
                        </p>
                        <div class="space-y-3">
                            <a href="tel:${CONFIG.PHONE.replace(/\s/g, '')}" class="flex items-center gap-3 hover:text-blue-400 transition-colors">
                                ${Utils.getIcon('phone', 18)}
                                <span>${CONFIG.PHONE}</span>
                            </a>
                            <a href="mailto:${CONFIG.EMAIL}" class="flex items-center gap-3 hover:text-blue-400 transition-colors">
                                ${Utils.getIcon('mail', 18)}
                                <span>${CONFIG.EMAIL}</span>
                            </a>
                            <div class="flex items-center gap-3">
                                ${Utils.getIcon('globe', 18)}
                                <span>${CONFIG.ADDRESS}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Links -->
                    <div>
                        <h3 class="text-white font-semibold text-lg mb-4">Ürünler</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Sabit Numara</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">0850 Numara</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Bulut Santral</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Çağrı Merkezi</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Toplu SMS</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="text-white font-semibold text-lg mb-4">Kurumsal</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Hakkımızda</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">İletişim</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Kariyer</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="text-white font-semibold text-lg mb-4">Destek</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Yardım Merkezi</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Dokümantasyon</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">API</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">SSS</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="text-white font-semibold text-lg mb-4">Yasal</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Gizlilik Politikası</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">Kullanım Koşulları</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-blue-400 transition-colors duration-200">KVKK</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Social Media -->
                <div class="border-t border-gray-800 pt-8">
                    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p class="text-gray-400 text-sm">
                            © ${currentYear} Velora Telekom. Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    `;
}