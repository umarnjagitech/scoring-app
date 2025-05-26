const API_BASE_URL = window.location.protocol + '//' + window.location.host + '/api'; // <--- IMPORTANT: Dynamic base URL now

const api = {
    post: async (endpoint, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const responseData = await response.json();
            if (response.ok && responseData.status === 'success') {
                return responseData;
            } else {
                throw new Error(responseData.message || `API Error: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error in POST ${endpoint}:`, error);
            throw error;
        }
    },

    get: async (endpoint, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/${endpoint}${queryString ? '?' + queryString : ''}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (response.ok && responseData.status === 'success') {
                return responseData;
            } else {
                throw new Error(responseData.message || `API Error: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error in GET ${endpoint}:`, error);
            throw error;
        }
    },

    login: (username, password) => api.post('login.php', { username, password }),
    addJudge: (username, password, name) => api.post('add_judge.php', { username, password, name }),
    getJudges: () => api.get('get_judges.php'),
    getParticipants: () => api.get('get_participants.php'),
    getJudgeScores: (judgeId) => api.get('get_scores.php', { judge_id: judgeId }),
    getOverallScoreboard: () => api.get('get_scores.php'),
    submitScore: (judgeId, participantId, scoreValue, comment) =>
        api.post('submit_score.php', { judge_id: judgeId, participant_id: participantId, score_value: scoreValue, comment: comment }),
};