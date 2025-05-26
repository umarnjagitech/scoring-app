const AUTH_KEY = 'judge_auth_data';

const auth = {
    setJudgeData: (judgeData) => {
        localStorage.setItem(AUTH_KEY, JSON.stringify(judgeData));
    },

    getJudgeData: () => {
        const data = localStorage.getItem(AUTH_KEY);
        return data ? JSON.parse(data) : null;
    },

    isLoggedIn: () => {
        return !!localStorage.getItem(AUTH_KEY);
    },

    logout: () => {
        localStorage.removeItem(AUTH_KEY);
    },

    requireLogin: () => {
        if (!auth.isLoggedIn()) {
            window.location.href = 'judge_login.html';
        }
    },

    redirectToDashboardIfLoggedIn: () => {
        if (auth.isLoggedIn()) {
            window.location.href = 'judge_dashboard.html';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('judge_login.html')) {
        auth.redirectToDashboardIfLoggedIn();

        const loginForm = document.getElementById('login-form');
        const messageArea = document.getElementById('message-area');

        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                messageArea.textContent = '';
                messageArea.className = 'mb-4 text-center';

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                try {
                    const response = await api.login(username, password);
                    auth.setJudgeData(response.judge);
                    window.location.href = 'judge_dashboard.html';
                } catch (error) {
                    messageArea.textContent = error.message || 'An unexpected error occurred.';
                    messageArea.classList.add('text-red-500');
                }
            });
        }
    }
});