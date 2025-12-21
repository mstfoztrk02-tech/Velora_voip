// Simple Router
const Router = {
    currentPage: 'home',
    
    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigate(e.state.page, false);
            }
        });
        
        // Handle initial load
        const path = window.location.pathname;
        const page = path.substring(1) || 'home';
        this.navigate(page, true);
    },
    
    navigate(page, pushState = true) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(el => {
            el.classList.remove('active');
        });
        
        // Show target page
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) {
            pageEl.classList.add('active');
            this.currentPage = page;
            
            // Update URL
            if (pushState) {
                history.pushState({ page }, '', `/${page}`);
            }
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    },
    
    linkTo(page) {
        this.navigate(page);
    }
};