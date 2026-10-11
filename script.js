"use strict";

const desktop = document.getElementById("desktop");
const windowArea = document.getElementById("windowArea");
const taskbarApps = document.getElementById("taskbarApps");
const startButton = document.getElementById("startButton");
const startMenu = document.getElementById("startMenu");
const startApps = document.getElementById("startApps");
const appSearch = document.getElementById("appSearch");
const notification = document.getElementById("notification");
const clock = document.getElementById("clock");
const greeting = document.getElementById("greeting");

const apps = {
    files: { name: "My Files", icon: "📁", width: 620, height: 410 },
    notes: { name: "Notes", icon: "📝", width: 560, height: 430 },
    browser: { name: "Browser", icon: "🌐", width: 680, height: 460 },
    games: { name: "Games", icon: "🎮", width: 540, height: 410 },
    settings: { name: "Settings", icon: "⚙️", width: 560, height: 430 },
    about: { name: "About FLUX", icon: "🐣", width: 480, height: 360 }
};

const openWindows = new Map();

let highestZ = 10;
let activeWindow = null;
let notificationTimer = null;

const greetings = [
    "Your computer is doing its best.",
    "Welcome back, human.",
    "Everything is under control. Probably.",
    "A desktop. Some apps. Infinite possibilities.",
    "Please pretend we have a help desk."
];

if (greeting) {
    greeting.textContent =
        greetings[Math.floor(Math.random() * greetings.length)];
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function showNotification(message) {
    if (!notification) return;

    notification.textContent = message;
    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(function () {
        notification.classList.remove("show");
    }, 2800);
}

function updateClock() {
    if (!clock) return;

    clock.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

updateClock();
setInterval(updateClock, 1000);

function getSavedValue(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
    } catch (error) {
        return fallback;
    }
}

function saveValue(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        showNotification('Couldn\'t save that in this browser.');
        return false;
    }
}

function getNotesContent() {
    return [
        '<h2>📝 My Notes</h2>',
        '<p>Ideas, reminders, and extremely important doodle descriptions.</p>',
        '<textarea class="app-textarea notes-editor" id="notesEditor" placeholder="Start typing here..." aria-label="Your notes"></textarea>',
        '<div class="notes-footer">',
        '  <span id="notesStatus">Notes save in this browser.</span>',
        '  <button class="app-button" id="saveNotes">Save notes</button>',
        '</div>'
    ].join('');
}

function getFilesContent() {
    return [
        '<h2>📁 My Files</h2>',
        '<p>Welcome to your digital room. Please excuse the mess.</p>',
        '<div class="file-grid">',
        '  <button class="file-item" data-file="Documents">',
        '    <span>📂</span><strong>Documents</strong>',
        '  </button>',
        '  <button class="file-item" data-file="Pictures">',
        '    <span>🖼️</span><strong>Pictures</strong>',
        '  </button>',
        '  <button class="file-item" data-file="Downloads">',
        '    <span>📥</span><strong>Downloads</strong>',
        '  </button>',
        '  <button class="file-item" data-file="Projects">',
        '    <span>💻</span><strong>Projects</strong>',
        '  </button>',
        '</div>',
        '<p class="small-note">These are demo folders, not your actual Windows files.</p>',
        '<div id="folderDetails" class="folder-details">',
        '  Pick a folder. It won\'t bite.',
        '</div>'
    ].join('');
}

function getBrowserContent() {
    return [
        '<h2>🌐 Tiny Browser</h2>',
        '<p>A website launcher. The internet is a big place.</p>',
        '<form id="browserForm" class="browser-form">',
        '  <input class="app-input" id="browserAddress" type="text" placeholder="example.com" aria-label="Website address">',
        '  <button class="app-button" type="submit">Visit ↗</button>',
        '</form>',
        '<div class="browser-shortcuts">',
        '  <button class="browser-link" data-url="https://www.wikipedia.org">📚 Wikipedia</button>',
        '  <button class="browser-link" data-url="https://www.google.com">🔎 Google</button>',
        '  <button class="browser-link" data-url="https://www.youtube.com">▶️ YouTube</button>',
        '  <button class="browser-link" data-url="https://github.com">💻 GitHub</button>',
        '</div>',
        '<p class="small-note">Websites open in a new browser tab. This isn\'t a full web browser.</p>'
    ].join('');
}

function getGamesContent() {
    return [
        '<h2>🎮 The Fun Department</h2>',
        '<p>Productivity has temporarily left the building.</p>',
        '<div class="game-card">',
        '  <div class="game-emoji">🎲</div>',
        '  <h3>Guess the Number</h3>',
        '  <p>I\'m thinking of a number between 1 and 20.</p>',
        '  <form id="guessForm" class="guess-form">',
        '    <input id="guessInput" class="app-input" type="number" min="1" max="20" placeholder="Your guess" required>',
        '    <button class="app-button" type="submit">Guess!</button>',
        '  </form>',
        '  <p id="guessResult" aria-live="polite">Let\'s see what you\'ve got.</p>',
        '  <button class="app-button" id="newGame">New game</button>',
        '</div>'
    ].join('');
}

function getSettingsContent() {
    return `
        <h2>⚙️ Settings</h2>
        <p>Make yourself at home.</p>

        <h3>Choose your wallpaper</h3>

        <div class="wallpaper-options">
            <button class="wallpaper-option" data-wallpaper="blue">
                <span class="wallpaper-preview blue-preview"></span>
                Ocean Blue
            </button>
            <button class="wallpaper-option" data-wallpaper="purple">
                <span class="wallpaper-preview purple-preview"></span>
                Purple Dream
            </button>
            <button class="wallpaper-option" data-wallpaper="sunset">
                <span class="wallpaper-preview sunset-preview"></span>
                Soft Sunset
            </button>
            <button class="wallpaper-option" data-wallpaper="green">
                <span class="wallpaper-preview green-preview"></span>
                Minty Fresh
            </button>
        </div>

        <h3>Desktop information</h3>
        <p>FLUX OS runs inside your web browser. It doesn't replace Windows.</p>

        <button class="app-button" id="resetWallpaper">
            Reset wallpaper
        </button>
    `;
}

function getAboutContent() {
    return `
        <div class="about-card">
            <div class="about-logo">✳</div>
            <h2>FLUX OS</h2>
            <p class="about-version">Beginner Edition</p>
            <p>
                A tiny desktop project made for learning, experimenting,
                and occasionally clicking the wrong thing.
            </p>
            <p>No robot overlord included.</p>
            <p class="small-note">Built with HTML, CSS, and JavaScript.</p>
        </div>
    `;
}

function getAppContent(id) {
    switch (id) {
        case "files":
            return getFilesContent();

        case "notes":
            return getNotesContent();

        case "browser":
            return getBrowserContent();

        case "games":
            return getGamesContent();

        case "settings":
            return getSettingsContent();

        case "about":
            return getAboutContent();

        default:
            return "<p>This app hasn't been invented yet.</p>";
    }
}

function focusWindow(win) {
    highestZ += 1;
    win.style.zIndex = highestZ;
    activeWindow = win;

    document.querySelectorAll(".taskbar-app").forEach(function (button) {
        button.classList.remove("active");
    });

    const record = openWindows.get(win.dataset.app);

    if (record && record.taskbarButton) {
        record.taskbarButton.classList.add("active");
    }
}

function closeWindow(id) {
    const record = openWindows.get(id);

    if (!record) return;

    record.element.remove();
    record.taskbarButton.remove();
    openWindows.delete(id);

    if (activeWindow === record.element) {
        activeWindow = null;
    }
}

function minimizeWindow(win) {
    win.classList.add("minimized");

    const record = openWindows.get(win.dataset.app);

    if (record) {
        record.taskbarButton.classList.remove("active");
    }

    if (activeWindow === win) {
        activeWindow = null;
    }
}

function toggleMaximize(win) {
    win.classList.toggle("maximized");
    focusWindow(win);
}

function makeDraggable(win) {
    const titlebar = win.querySelector(".window-titlebar");

    if (!titlebar) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    titlebar.addEventListener("pointerdown", function (event) {
        if (event.target.closest(".window-controls")) return;
        if (win.classList.contains("maximized")) return;

        dragging = true;
        startX = event.clientX;
        startY = event.clientY;

        const rect = win.getBoundingClientRect();
        const areaRect = windowArea.getBoundingClientRect();

        originX = rect.left - areaRect.left;
        originY = rect.top - areaRect.top;

        titlebar.setPointerCapture(event.pointerId);
        focusWindow(win);
    });

    titlebar.addEventListener("pointermove", function (event) {
        if (!dragging) return;

        const areaRect = windowArea.getBoundingClientRect();

        let x = originX + event.clientX - startX;
        let y = originY + event.clientY - startY;

        x = Math.max(0, Math.min(x, areaRect.width - 100));
        y = Math.max(0, Math.min(y, areaRect.height - 50));

        win.style.left = x + "px";
        win.style.top = y + "px";
        win.style.transform = "none";
    });

    function stopDragging() {
        dragging = false;
    }

    titlebar.addEventListener("pointerup", stopDragging);
    titlebar.addEventListener("pointercancel", stopDragging);
}

function connectFiles(win) {
    const details = win.querySelector("#folderDetails");

    const messages = {
        Documents: "No documents yet. A very peaceful office.",
        Pictures: "No pictures yet. The gallery is waiting.",
        Downloads: "Nothing downloaded. Suspiciously tidy.",
        Projects: "Your future masterpieces belong here."
    };

    win.querySelectorAll("[data-file]").forEach(function (button) {
        button.addEventListener("click", function () {
            const folder = button.dataset.file;
            details.textContent = messages[folder] || "This folder is empty.";
        });
    });
}

function connectNotes(win) {
    const editor = win.querySelector("#notesEditor");
    const saveButton = win.querySelector("#saveNotes");
    const status = win.querySelector("#notesStatus");

    editor.value = getSavedValue("flux-notes", "");

    saveButton.addEventListener("click", function () {
        if (saveValue("flux-notes", editor.value)) {
            status.textContent = "Saved! Your notes are safe. 💾";
            showNotification("📝 Notes saved successfully.");
        }
    });

    let saveTimer;

    editor.addEventListener("input", function () {
        status.textContent = "Saving your thoughts...";

        clearTimeout(saveTimer);

        saveTimer = setTimeout(function () {
            if (saveValue("flux-notes", editor.value)) {
                status.textContent = "Saved automatically. ✨";
            }
        }, 500);
    });
}

function connectBrowser(win) {
    const form = win.querySelector("#browserForm");
    const address = win.querySelector("#browserAddress");

    function visitWebsite(value) {
        let destination = value.trim();

        if (!destination) {
            showNotification("Type a website first. I'm not a mind reader.");
            return;
        }

        if (!/^https?:\/\//i.test(destination)) {
            destination = "https://" + destination;
        }

        try {
            const parsed = new URL(destination);

            if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
                throw new Error("Invalid protocol");
            }

            window.open(parsed.href, "_blank", "noopener,noreferrer");
        } catch (error) {
            showNotification("That website address doesn't look right.");
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        visitWebsite(address.value);
    });

    win.querySelectorAll("[data-url]").forEach(function (button) {
        button.addEventListener("click", function () {
            visitWebsite(button.dataset.url);
        });
    });
}

function connectGames(win) {
    let secretNumber = Math.floor(Math.random() * 20) + 1;
    let attempts = 0;
    let solved = false;

    const form = win.querySelector("#guessForm");
    const input = win.querySelector("#guessInput");
    const result = win.querySelector("#guessResult");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const guess = Number(input.value);

        if (!Number.isInteger(guess) || guess < 1 || guess > 20) {
            result.textContent = "Pick a whole number from 1 to 20.";
            return;
        }

        if (solved) {
            result.textContent = "You've already won! Start a new game.";
            return;
        }

        attempts += 1;

        if (guess === secretNumber) {
            solved = true;

            result.textContent =
                "Correct! You won in " + attempts +
                (attempts === 1 ? " guess. 🎉" : " guesses. 🎉");
        } else if (guess < secretNumber) {
            result.textContent = "Too low! Aim higher. ⬆️";
        } else {
            result.textContent = "Too high! Bring it down. ⬇️";
        }

        input.select();
    });

    win.querySelector("#newGame").addEventListener("click", function () {
        secretNumber = Math.floor(Math.random() * 20) + 1;
        attempts = 0;
        solved = false;
        input.value = "";
        result.textContent = "New number picked. Round two!";
    });
}

function setWallpaper(name) {
    const wallpapers = {
        blue: [
            "radial-gradient(ellipse at 15% 20%, rgba(99,116,255,.68), transparent 42%)",
            "radial-gradient(ellipse at 85% 25%, rgba(196,113,255,.48), transparent 38%)",
            "radial-gradient(ellipse at 65% 90%, rgba(66,190,211,.28), transparent 40%)",
            "linear-gradient(135deg,#171a3b,#28265b 48%,#161c40)"
        ].join(","),

        purple: [
            "radial-gradient(ellipse at 20% 20%,rgba(189,116,255,.6),transparent 45%)",
            "radial-gradient(ellipse at 80% 80%,rgba(106,87,221,.5),transparent 45%)",
            "linear-gradient(135deg,#201432,#3d2864,#18152f)"
        ].join(","),

        sunset: [
            "radial-gradient(ellipse at 15% 20%,rgba(255,178,124,.65),transparent 45%)",
            "radial-gradient(ellipse at 85% 70%,rgba(237,117,174,.45),transparent 42%)",
            "linear-gradient(135deg,#49305c,#8c4776,#29204b)"
        ].join(","),

        green: [
            "radial-gradient(ellipse at 20% 20%,rgba(98,220,177,.5),transparent 45%)",
            "radial-gradient(ellipse at 80% 75%,rgba(99,142,255,.4),transparent 42%)",
            "linear-gradient(135deg,#153e46,#244b64,#172744)"
        ].join(",")
    };

    desktop.style.background = wallpapers[name] || wallpapers.blue;
    saveValue("flux-wallpaper", name);
}

function connectSettings(win) {
    win.querySelectorAll("[data-wallpaper]").forEach(function (button) {
        button.addEventListener("click", function () {
            setWallpaper(button.dataset.wallpaper);
            showNotification("🎨 Wallpaper changed. Looking good.");
        });
    });

    win.querySelector("#resetWallpaper").addEventListener("click", function () {
        setWallpaper("blue");
        showNotification("Back to the classic FLUX wallpaper.");
    });
}

function connectApp(id, win) {
    if (id === "files") connectFiles(win);
    if (id === "notes") connectNotes(win);
    if (id === "browser") connectBrowser(win);
    if (id === "games") connectGames(win);
    if (id === "settings") connectSettings(win);
}

function openApp(id) {
    if (!apps[id]) return;

    startMenu.hidden = true;
    startButton.classList.remove("active");

    const existing = openWindows.get(id);

    if (existing) {
        existing.element.classList.remove("minimized");
        focusWindow(existing.element);
        return;
    }

    const app = apps[id];
    const win = document.createElement("section");

    win.className = "window";
    win.dataset.app = id;
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", app.name);

    win.style.width = "min(" + app.width + "px, calc(100% - 100px))";
    win.style.height = "min(" + app.height + "px, calc(100% - 36px))";

    win.innerHTML = `
        <div class="window-titlebar">
            <div class="window-title">
                <span class="window-title-icon">${app.icon}</span>
                <span>${escapeHTML(app.name)}</span>
            </div>

            <div class="window-controls">
                <button class="window-minimize" aria-label="Minimize">−</button>
                <button class="window-maximize" aria-label="Maximize">□</button>
                <button class="window-close" aria-label="Close">✕</button>
            </div>
        </div>

        <div class="window-content">${getAppContent(id)}</div>
    `;

    windowArea.appendChild(win);

    const taskButton = document.createElement("button");
    taskButton.className = "taskbar-app";
    taskButton.textContent = app.icon;
    taskButton.title = app.name;
    taskButton.setAttribute("aria-label", app.name);

    const record = {
        id: id,
        element: win,
        taskbarButton: taskButton
    };

    openWindows.set(id, record);
    taskbarApps.appendChild(taskButton);

    taskButton.addEventListener("click", function () {
        if (win.classList.contains("minimized")) {
            win.classList.remove("minimized");
            focusWindow(win);
        } else if (activeWindow === win) {
            minimizeWindow(win);
        } else {
            focusWindow(win);
        }
    });

    win.addEventListener("pointerdown", function () {
        focusWindow(win);
    });

    win.querySelector(".window-close").addEventListener("click", function () {
        closeWindow(id);
    });

    win.querySelector(".window-minimize").addEventListener("click", function () {
        minimizeWindow(win);
    });

    win.querySelector(".window-maximize").addEventListener("click", function () {
        toggleMaximize(win);
    });

    makeDraggable(win);
    connectApp(id, win);
    focusWindow(win);

    showNotification(app.icon + " " + app.name + " opened. Nothing exploded.");
}

function populateStartMenu() {
    startApps.innerHTML = "";

    Object.entries(apps).forEach(function (entry) {
        const id = entry[0];
        const app = entry[1];

        const button = document.createElement("button");
        button.className = "start-app";
        button.dataset.app = id;

        button.innerHTML =
            "<span>" + app.icon + "</span>" +
            "<span>" + escapeHTML(app.name) + "</span>";

        button.addEventListener("click", function () {
            openApp(id);
        });

        startApps.appendChild(button);
    });
}

function filterApps(query) {
    const search = query.toLowerCase().trim();

    startApps.querySelectorAll(".start-app").forEach(function (button) {
        button.hidden = !button.textContent.toLowerCase().includes(search);
    });
}

document.querySelectorAll(".desktop-icon").forEach(function (button) {
    button.addEventListener("click", function () {
        openApp(button.dataset.app);
    });
});

startButton.addEventListener("click", function () {
    startMenu.hidden = !startMenu.hidden;
    startButton.classList.toggle("active", !startMenu.hidden);

    if (!startMenu.hidden) {
        appSearch.value = "";
        filterApps("");
        appSearch.focus();
    }
});

document.getElementById("closeStartMenu").addEventListener("click", function () {
    startMenu.hidden = true;
    startButton.classList.remove("active");
});

appSearch.addEventListener("input", function () {
    filterApps(appSearch.value);
});

document.addEventListener("pointerdown", function (event) {
    if (
        !startMenu.hidden &&
        !startMenu.contains(event.target) &&
        !startButton.contains(event.target)
    ) {
        startMenu.hidden = true;
        startButton.classList.remove("active");
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        startMenu.hidden = true;
        startButton.classList.remove("active");
    }
});

document.getElementById("powerButton").addEventListener("click", function () {
    showNotification("⏻ Closing this browser tab is your shutdown button.");
});

populateStartMenu();

const savedWallpaper = getSavedValue("flux-wallpaper", "blue");
setWallpaper(savedWallpaper);

showNotification("🐣 Welcome to FLUX OS. Please enjoy your stay.");
