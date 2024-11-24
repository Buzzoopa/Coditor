// Initialize CodeMirror editor
const editor = CodeMirror(document.getElementById("editor"), {
    mode: "htmlmixed", // Default mode for HTML
    theme: "material-darker",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    tabSize: 2,
    lineWrapping: true,
});
editor.setSize("100%", "100%");

// Global state for opened files
let fileHandles = {};

// Open folder and populate sidebar (Only works in Chrome and Edge)
async function openFolder() {
    try {
        // Check if the File System Access API is available
        if ('showDirectoryPicker' in window) {
            const dirHandle = await window.showDirectoryPicker();
            const fileExplorer = document.getElementById("file-explorer");
            fileExplorer.innerHTML = ""; // Clear current sidebar
            fileHandles = {};

            // Loop over directory entries and add to the sidebar
            for await (const entry of dirHandle.values()) {
                if (entry.kind === "file") {
                    const fileElement = document.createElement("div");
                    fileElement.className = "file";
                    fileElement.textContent = entry.name;

                    // Add file to the editor on click
                    fileElement.addEventListener("click", async () => {
                        const file = await entry.getFile();
                        const content = await file.text();
                        editor.setValue(content);
                        document.getElementById("file-name").value = entry.name;

                        // Set syntax highlighting mode based on file extension
                        const extension = entry.name.split(".").pop().toLowerCase();
                        const mode = extension === "js" ? "javascript" :
                                    extension === "css" ? "css" :
                                    "htmlmixed";
                        editor.setOption("mode", mode);

                        fileHandles[entry.name] = entry; // Save reference
                    });

                    fileExplorer.appendChild(fileElement);
                }
            }
        } else {
            alert("File System Access API is not supported in this browser.");
        }
    } catch (err) {
        alert("Failed to open folder: " + err);
    }
}

// Fallback for Firefox (File input for file selection)
if (!('showDirectoryPicker' in window)) {
    document.getElementById("sidebar").style.display = 'none'; // Hide sidebar in Firefox
    document.getElementById("open-folder").addEventListener("click", () => {
        // Trigger the file input dialog for browsers that don't support the File System Access API
        document.getElementById("file-input").click();
    });
}

// Handle file selection from input dialog
document.getElementById("file-input").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
        const content = await file.text();
        editor.setValue(content);
        document.getElementById("file-name").value = file.name;

        // Set syntax highlighting mode based on file extension
        const extension = file.name.split(".").pop().toLowerCase();
        const mode = extension === "js" ? "javascript" :
                    extension === "css" ? "css" :
                    "htmlmixed";
        editor.setOption("mode", mode);
    }
});

// Save file functionality
document.getElementById("export").addEventListener("click", async () => {
    const fileName = document.getElementById("file-name").value;
    const fileHandle = fileHandles[fileName];

    if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(editor.getValue());
        await writable.close();
    }
});

// Add event listener to open folder button
document.getElementById("open-folder").addEventListener("click", openFolder);


window.onload = function() {
    const editor = CodeMirror(document.getElementById('editor'), {
        mode: "htmlmixed",  // Default mode
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        theme: "material-darker",
        viewportMargin: Infinity // Allow unlimited scrolling
    });

    // Dynamically resize the editor to match window size
    window.addEventListener('resize', function() {
        editor.setSize("100%", "100%");
    });

    editor.setSize("100%", "100%"); // Set initial size
};

const resizeHandle = document.getElementById('resize-handle');
const sidebar = document.getElementById('sidebar');

let isResizing = false;
let lastDownX = 0;

resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    lastDownX = e.clientX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
    });
});

function handleMouseMove(e) {
    if (isResizing) {
        const offset = e.clientX - lastDownX;
        const newWidth = sidebar.offsetWidth + offset;
        if (newWidth > 150) {  // Set a minimum width limit
            sidebar.style.width = `${newWidth}px`;
            resizeHandle.style.left = `${newWidth}px`;  // Update resize handle position
            lastDownX = e.clientX;
        }
    }
}
