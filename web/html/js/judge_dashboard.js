document.addEventListener('DOMContentLoaded', () => {
    auth.requireLogin();

    const judgeData = auth.getJudgeData();
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');
    const participantsTableBody = document.getElementById('participants-table-body');
    const scoreForm = document.getElementById('score-form');
    const messageArea = document.getElementById('message-area');

    if (judgeData) {
        welcomeMessage.textContent = `Welcome, ${judgeData.name || judgeData.username}!`;
    }

    logoutButton.addEventListener('click', () => {
        auth.logout();
        window.location.href = 'judge_login.html';
    });

    const displayMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `mb-4 text-center ${isError ? 'text-red-500' : 'text-green-500'}`;
    };

    const loadParticipantsAndScores = async () => {
        participantsTableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">Loading participants and your scores...</td></tr>';
        messageArea.textContent = '';

        try {
            const [participantsData, judgeScoresData] = await Promise.all([
                api.getParticipants(),
                api.getJudgeScores(judgeData.id)
            ]);

            const participants = participantsData.participants;
            const judgeScores = judgeScoresData.scores;

            participantsTableBody.innerHTML = '';

            if (participants.length === 0) {
                participantsTableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No participants found.</td></tr>';
                return;
            }

            participants.forEach((participant, index) => {
                const existingScore = judgeScores.find(s => s.participant_id === participant.id);
                const scoreValue = existingScore ? existingScore.score_value : '';
                const comment = existingScore ? existingScore.comment || '' : '';

                const row = document.createElement('tr');
                row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${participant.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <input type="number" name="score_${participant.id}" value="${scoreValue}" min="0" max="100" placeholder="0-100"
                               class="shadow appearance-none border rounded w-24 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <input type="text" name="comment_${participant.id}" value="${comment}" placeholder="Optional comment"
                               class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </td>
                `;
                participantsTableBody.appendChild(row);
            });
        } catch (error) {
            displayMessage(`Error loading data: ${error.message}`, true);
            participantsTableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-red-500">Failed to load data.</td></tr>';
        }
    };

    scoreForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        displayMessage('Submitting scores...', false);
        messageArea.className = 'mb-4 text-center text-gray-700';

        const formData = new FormData(scoreForm);
        let submittedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const [key, value] of formData.entries()) {
            if (key.startsWith('score_')) {
                const participantId = parseInt(key.replace('score_', ''));
                const scoreValue = value.trim() === '' ? null : parseInt(value);
                const comment = formData.get(`comment_${participantId}`) || null;

                if (scoreValue === null || isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
                    errors.push(`Invalid score for participant ID ${participantId}. Must be between 0 and 100.`);
                    errorCount++;
                    continue;
                }

                try {
                    await api.submitScore(judgeData.id, participantId, scoreValue, comment);
                    submittedCount++;
                } catch (error) {
                    errors.push(`Failed to submit score for participant ID ${participantId}: ${error.message}`);
                    errorCount++;
                }
            }
        }

        if (errorCount > 0) {
            displayMessage(`Submission complete with ${submittedCount} successes and ${errorCount} errors: ${errors.join('; ')}`, true);
        } else if (submittedCount > 0) {
            displayMessage(`Successfully submitted/updated ${submittedCount} scores!`, false);
        } else {
             displayMessage('No valid scores were entered or changed.', false);
        }

        loadParticipantsAndScores();
    });

    loadParticipantsAndScores();
});