document.addEventListener('DOMContentLoaded', () => {
    const addJudgeForm = document.getElementById('add-judge-form');
    const judgesTableBody = document.getElementById('judges-table-body');
    const messageArea = document.getElementById('message-area');

    const displayMessage = (message, isError = false) => {
        messageArea.textContent = message;
        messageArea.className = `mb-4 text-center ${isError ? 'text-red-500' : 'text-green-500'}`;
    };

    const fetchJudges = async () => {
        judgesTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Loading judges...</td></tr>';
        messageArea.textContent = '';

        try {
            const data = await api.getJudges();
            const judges = data.judges;

            judgesTableBody.innerHTML = '';

            if (judges.length === 0) {
                judgesTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No judges found.</td></tr>';
                return;
            }

            judges.forEach((judge, index) => {
                const row = document.createElement('tr');
                row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${judge.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${judge.username}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${judge.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(judge.created_at).toLocaleString()}</td>
                `;
                judgesTableBody.appendChild(row);
            });
        } catch (error) {
            displayMessage(`Failed to load judges: ${error.message}`, true);
            judgesTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading data.</td></tr>';
        }
    };

    addJudgeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        displayMessage('Adding judge...', false);
        messageArea.className = 'mb-4 text-center text-gray-700';

        const username = document.getElementById('new-judge-username').value;
        const name = document.getElementById('new-judge-name').value;
        const password = document.getElementById('new-judge-password').value;

        try {
            const response = await api.addJudge(username, password, name);
            displayMessage(response.message, false);
            addJudgeForm.reset();
            fetchJudges();
        } catch (error) {
            displayMessage(`Error adding judge: ${error.message}`, true);
        }
    });

    fetchJudges();
});