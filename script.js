/**
 * script.js
 * Core logic and state management for the Free Fire Suggestion Website.
 * Handles simulated login, logout, and frontend data updates (voting).
 */

const USER_STATE_KEY = 'ffSuggestUserState';
const SUGGESTIONS_KEY = 'ffSuggestions';

// --- MOCK DATA ---

const initialSuggestions = [
    { id: 1, title: 'New "Arctic" Snow Map', category: 'Map', description: 'Introduce a new, smaller map featuring snowy mountains and frozen lakes for faster, more intense combat.', votes: 450, isVoted: false, author: 'GamerX' },
    { id: 2, title: 'Revamp Character Ability Cooldowns', category: 'Gameplay', description: 'Reduce the long cooldown timers on active abilities (like Chrono\'s shield) to encourage more dynamic play.', votes: 620, isVoted: false, author: 'ProPlayerFF' },
    { id: 3, title: 'Customizable Scope Reticles', category: 'Cosmetic', description: 'Allow players to change the color and shape of their scope reticles for better visibility against different backgrounds.', votes: 310, isVoted: false, author: 'ScopeGod' },
    { id: 4, title: 'A New "Support" Class Gun (Healer)', category: 'Weapon', description: 'Add a rifle that can heal teammates (slowly) when aimed and shot at them, creating a true support role.', votes: 550, isVoted: false, author: 'MedicMan' },
    { id: 5, title: 'Dynamic Weather System', category: 'Graphics', description: 'Implement occasional rain or fog during matches to change visibility and map traversal strategies.', votes: 780, isVoted: false, author: 'WeatherFan' },
];

const initialUserState = {
    isLoggedIn: false,
    username: null,
    goldBalance: 0, // Mock currency
};

// --- STATE MANAGEMENT ---

let appState = {
    user: JSON.parse(localStorage.getItem(USER_STATE_KEY)) || initialUserState,
    suggestions: JSON.parse(localStorage.getItem(SUGGESTIONS_KEY)) || initialSuggestions,
};

/** Saves the current state to localStorage. */
const saveState = () => {
    localStorage.setItem(USER_STATE_KEY, JSON.stringify(appState.user));
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(appState.suggestions));
    updateUIForAuthState(); // Update navigation immediately after saving
};

/** Formats a number for readability (e.g., 4,500) */
const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

// --- AUTHENTICATION LOGIC ---

/** Simulates a successful login and updates the state. */
window.simulateLogin = (username) => {
    appState.user = {
        isLoggedIn: true,
        username: username,
        goldBalance: 5000, // Initial gold
    };
    saveState();
    // Redirect to the homepage after login
    window.location.href = 'index.html';
};

/** Simulates user logout and resets state. */
window.simulateLogout = () => {
    appState.user = initialUserState;
    saveState();
    window.location.reload(); // Refresh the page to update content
};

/**
 * Updates the navigation bar and buttons based on the current login status.
 */
const updateUIForAuthState = () => {
    const navRight = document.getElementById('nav-right');
    const loggedInSection = document.getElementById('logged-in-user');
    const loginButton = document.getElementById('login-button');

    if (appState.user.isLoggedIn) {
        if (loggedInSection) loggedInSection.classList.remove('hidden');
        if (loginButton) loginButton.classList.add('hidden');
        
        const usernameEl = document.getElementById('user-username');
        const goldEl = document.getElementById('user-gold');

        if (usernameEl) usernameEl.textContent = appState.user.username;
        if (goldEl) goldEl.textContent = formatNumber(appState.user.goldBalance);

    } else {
        if (loggedInSection) loggedInSection.classList.add('hidden');
        if (loginButton) loginButton.classList.remove('hidden');
    }
};

// --- SUGGESTION LOGIC ---

/**
 * Handles the simulated voting process.
 * @param {number} id The ID of the suggestion to vote on.
 */
window.handleVote = (id) => {
    if (!appState.user.isLoggedIn) {
        // Use a styled modal instead of alert()
        showModal('Login Required', 'You must log in to cast your vote and support a suggestion.', 'login.html');
        return;
    }

    const suggestion = appState.suggestions.find(s => s.id === id);
    if (!suggestion) return;

    if (suggestion.isVoted) {
        // Simulate removing a vote (if desired, currently only supports adding)
        showModal('Vote Error', 'You have already voted for this suggestion.', null);
        return;
    }

    // SIMULATE VOTE SUCCESS
    suggestion.votes += 1;
    suggestion.isVoted = true; // Mark as voted in the current session/state

    saveState();
    renderSuggestions(); // Re-render the list to update the vote count and button
    createToast(`Voted successfully for "${suggestion.title}"!`, true);
};

/**
 * Renders the list of suggestions in the main gallery.
 */
const renderSuggestions = () => {
    const gallery = document.getElementById('suggestions-gallery');
    if (!gallery) return;

    gallery.innerHTML = ''; // Clear existing content

    appState.suggestions.forEach(s => {
        // Determine button state based on login status and local 'isVoted' flag
        let buttonContent, buttonClasses;

        if (!appState.user.isLoggedIn) {
            buttonContent = 'Log In to Vote';
            buttonClasses = 'bg-gray-800 hover:bg-gray-700 cursor-pointer';
        } else if (s.isVoted) {
            buttonContent = 'Voted!';
            buttonClasses = 'bg-green-700 cursor-default opacity-80';
        } else {
            buttonContent = 'Vote Up';
            buttonClasses = 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 cursor-pointer';
        }

        const card = document.createElement('div');
        card.className = 'suggestion-card bg-white p-6 rounded-xl shadow-2xl transition duration-300 hover:shadow-yellow-500/50 hover:ring-2 hover:ring-yellow-500 border border-gray-200';
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <span class="text-xs font-mono font-bold uppercase text-gray-600 bg-gray-100 px-3 py-1 rounded-full">${s.category}</span>
                <span class="text-sm font-semibold text-gray-500">Suggested by: ${s.author}</span>
            </div>
            
            <h3 class="text-2xl font-extrabold text-gray-900 mb-3">${s.title}</h3>
            <p class="text-gray-700 mb-6 line-clamp-3">${s.description}</p>
            
            <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                <!-- Vote Count -->
                <div class="flex items-center space-x-2">
                    <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11l3-5m0 0l3 5m-3-5v14m0 0l-3-5m3 5l3-5"></path></svg>
                    <span class="text-3xl font-mono font-extrabold text-gray-900">${formatNumber(s.votes)}</span>
                </div>
                
                <!-- Action Button -->
                <button onclick="${appState.user.isLoggedIn && !s.isVoted ? `handleVote(${s.id})` : !appState.user.isLoggedIn ? `window.location.href='login.html'` : ''}"
                        class="px-6 py-3 text-sm font-bold rounded-full transition duration-300 transform hover:scale-[1.03] shadow-lg ${buttonClasses}">
                    ${buttonContent}
                </button>
            </div>
        `;
        gallery.appendChild(card);
    });
    
    // Setup for adding a new suggestion
    setupAddSuggestionForm();
};

const setupAddSuggestionForm = () => {
    const form = document.getElementById('add-suggestion-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!appState.user.isLoggedIn) {
                showModal('Login Required', 'You must log in to submit a new suggestion.', 'login.html');
                return;
            }

            const title = document.getElementById('suggestion-title').value.trim();
            const category = document.getElementById('suggestion-category').value;
            const description = document.getElementById('suggestion-description').value.trim();

            if (!title || !category || !description) {
                 createToast('Please fill out all fields.', false);
                 return;
            }

            const newSuggestion = {
                id: appState.suggestions.length + 1,
                title,
                category,
                description,
                votes: 1, // Auto-vote upon submission
                isVoted: true,
                author: appState.user.username,
            };

            appState.suggestions.unshift(newSuggestion); // Add to the start
            appState.user.goldBalance -= 50; // Simulate a small cost to prevent spam
            
            saveState();
            renderSuggestions();
            form.reset();
            createToast(`Suggestion submitted and automatically voted! -50 Gold.`, true);
        });
    }
}

// --- UI COMPONENTS ---

/**
 * Creates a toast notification.
 */
const createToast = (message, isSuccess = true) => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-2xl transition-opacity duration-300 ${
        isSuccess ? 'bg-green-600' : 'bg-red-600'
    } text-white font-bold max-w-sm`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
};

/**
 * Displays a custom modal box (instead of alert/confirm).
 * @param {string} title The modal title.
 * @param {string} message The modal message.
 * @param {string|null} redirectUrl If provided, the confirm button redirects here.
 */
const showModal = (title, message, redirectUrl = null) => {
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div id="custom-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900 bg-opacity-80 transition-opacity duration-300">
            <div class="bg-white p-8 rounded-xl shadow-3xl max-w-lg w-full transform scale-95 transition-transform duration-300">
                <h3 class="text-3xl font-extrabold text-yellow-500 border-b pb-3 mb-4">${title}</h3>
                <p class="text-gray-700 mb-6">${message}</p>
                <div class="flex justify-end space-x-4">
                    <button onclick="document.getElementById('custom-modal').remove()"
                            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition duration-200">
                        Close
                    </button>
                    ${redirectUrl ? `
                    <a href="${redirectUrl}"
                       class="px-6 py-2 bg-yellow-500 text-gray-900 font-bold rounded-full hover:bg-yellow-400 transition duration-200 shadow-md">
                        Go to Login
                    </a>` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};


// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Auth State and Update UI
    updateUIForAuthState();

    // 2. Initialize Page-Specific Functionality
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path === '/') {
        renderSuggestions();
    }
});