document.addEventListener('DOMContentLoaded', () => {
    const scoreboardBody = document.getElementById('scoreboard-body');
    const refreshButton = document.getElementById('refresh-button');
    const messageArea = document.getElementById('message-area');

    const displayMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `mb-4 text-center ${isError ? 'text-red-500' : 'text-green-500'}`;
    };

    const fetchScoreboard = async () => {
        scoreboardBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">Loading scores...</td></tr>';
        messageArea.textContent = '';

        try {
            const data = await api.getOverallScoreboard();
            const scores = data.overall_scoreboard;

            scoreboardBody.innerHTML = '';

            if (scores.length === 0) {
                scoreboardBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No scores submitted yet.</td></tr>';
                return;
            }

            scores.forEach((score, index) => {
                let rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                if (index === 0) rowClass += ' highlight-gold';
                else if (index === 1) rowClass += ' highlight-silver';
                else if (index === 2) rowClass += ' highlight-bronze';

                const row = document.createElement('tr');
                row.className = rowClass;
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${score.participant_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${score.total_score}</td>
                `;
                scoreboardBody.appendChild(row);
            });
        } catch (error) {
            displayMessage(`Failed to load scoreboard: ${error.message}`, true);
            scoreboardBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-red-500">Error loading data.</td></tr>';
        }
    };

    refreshButton.addEventListener('click', fetchScoreboard);

    fetchScoreboard();
    setInterval(fetchScoreboard, 10000);
});