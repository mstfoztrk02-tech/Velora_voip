// Configuration
const CONFIG = {
    BACKEND_URL: window.location.origin,
    API_PREFIX: '/api',
    APP_NAME: 'Velora Telekom',
    PHONE: '0850 000 00 00',
    EMAIL: 'info@velora.com.tr',
    ADDRESS: 'İstanbul, Türkiye'
};

// Mock Data
const MOCK_DATA = {
    services: [
        {
            id: 1,
            title: "Sabit Numara",
            description: "Kolayca coğrafi numaraları kullanmaya başlayın!",
            icon: "phone",
            link: "#"
        },
        {
            id: 2,
            title: "850 Numara",
            description: "Numaranızı hızlıca tek panelden tahsis edin!",
            icon: "hash",
            link: "#"
        },
        {
            id: 3,
            title: "Bulut Santral",
            description: "Tüm çağrılarınızı tek panelden kolayca yönetin",
            icon: "cloud",
            link: "#"
        },
        {
            id: 4,
            title: "Çağrı Merkezi",
            description: "Müşteri Hizmetleri sürecini uçtan uca yönetin.",
            icon: "headphones",
            link: "#"
        },
        {
            id: 5,
            title: "Toplu SMS",
            description: "Yüksek hacimli SMS gönderimlerinizi anında iletin.",
            icon: "message-square",
            link: "#"
        },
        {
            id: 6,
            title: "OTP SMS",
            description: "Doğrulama kodları için uygulamanızla entegre olun.",
            icon: "lock",
            link: "#"
        },
        {
            id: 7,
            title: "İYS",
            description: "SMS, ses ve mail ileti izinlerinizi kolayca yönetin.",
            icon: "mail",
            link: "#"
        }
    ],
    features: [
        {
            id: 1,
            title: "15 Yılı Aşkın Tecrübe",
            description: "2008 yılında kurulan şirketimiz, 15 yılı aşkın süredir telekomünikasyon alanında yüksek deneyimli personelleriyle hizmet vermektedir.",
            icon: "award"
        },
        {
            id: 2,
            title: "Müşteri Odaklı Hizmet",
            description: "Abonelerimize hizmet öncesi ve sonrası teknik ve operasyonel süreçlerde hızlı ve kaliteli destek vermeyi misyon edinmiştir.",
            icon: "users"
        },
        {
            id: 3,
            title: "Coğrafi Yedeklilik",
            description: "TIER III sertifikasına sahip Türk Telekom veri merkezlerinde aktif-aktif çalışan sistemlerle coğrafi yedeklilik sağlanmaktadır.",
            icon: "globe"
        }
    ],
    faqs: [
        {
            id: 1,
            question: "Velora kimdir? Hangi hizmetleri verir?",
            answer: "Velora, BTK tarafından STH lisansı ile yetkilendirilmiş, tüm operatörlerle doğrudan ara bağlantısı olan yeni nesil telekom operatörüdür."
        },
        {
            id: 2,
            question: "Velora'dan nasıl sabit numara tahsis edebilirim?",
            answer: "Velora'dan sabit telefon numarasına hızlı ve kolayca sahip olabilirsiniz. Müsait numaralarımızı incelemek ve sahip olmak için bizimle iletişime geçebilirsiniz."
        }
    ]
};