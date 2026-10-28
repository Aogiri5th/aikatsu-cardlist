async function sha256(text) {
    const buffer = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hash)).map(x =>x.toString(16).padStart(2, "0")).join("");
}

async function authenticate() {
    const password = document.getElementById("password").value;
    const response = await fetch("./json/password.json");
    const config = await response.json();
    const inputHash = await sha256(password);

    if (inputHash === config.hash) {
        sessionStorage.setItem("authenticated", "true");
        showCardList();
    } else {
        document.getElementById("error").textContent = "パスワードが違います";
    }
}

async function showCardList() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("app").classList.add("show");

    const html = await fetch("./cardlist.html").then(r => r.text());
    document.getElementById("app").innerHTML = html;
    loadCards();
}

document.getElementById("login-btn").addEventListener("click", authenticate);
document.getElementById("password").addEventListener("keydown", e => {
    if (e.key === "Enter") {
        authenticate();
    }
});

if (sessionStorage.getItem("authenticated") === "true") {
    showCardList();
}