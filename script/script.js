const MAX_COUNT = 3;
const LABELS = ["×", "１", "２", "３"];
const content = document.getElementById("content");

fetch("./cards.json").then(res => res.json()).then(cards => {
    cards.sort((a, b) => a.gameOrder - b.gameOrder || a.seriesOrder - b.seriesOrder || a.cardOrder - b.cardOrder);

    const games = {};
    cards.forEach(card => {
        if (!games[card.game]) {
            games[card.game] = {};
        }
        if (!games[card.game][card.series]) {
            games[card.game][card.series] = [];
        }
        games[card.game][card.series].push(card);
    });

    Object.entries(games).forEach(([game, seriesMap]) => {
        const gameTitle = document.createElement("h1");
        gameTitle.textContent = game;
        content.appendChild(gameTitle);

        Object.entries(seriesMap).forEach(([series, cards]) => {
            const section = document.createElement("section");
            const title = document.createElement("h2");
            title.textContent = series;

            const summary = document.createElement("div");
            summary.className = "series-summary";
            summary.dataset.game = game;
            summary.dataset.series = series;
            section.appendChild(title);
            section.appendChild(summary);

            const grid = document.createElement("div");
            grid.className = "card-grid";

            cards.forEach(card => {
                const count = Number(localStorage.getItem(card.id)) || 0;
                const imagePath = `./cards/${card.game}/${card.series}/${card.id}.${card.ext}`;
                grid.appendChild(createCard(card, imagePath, count));
            });

            section.appendChild(grid);
            content.appendChild(section);
        });
    });

    updateSummary();
});

function createCard(card, imagePath, initialCount) {
    let count = initialCount;

    const container = document.createElement("div");
    container.className = `card count-${count}`;
    container.dataset.game = card.game;
    container.dataset.series = card.series;

    const img = document.createElement("img");
    img.src = imagePath;
    img.alt = card.id;

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = LABELS[count];

    container.appendChild(img);
    container.appendChild(badge);
    container.addEventListener("click", () => {
        count = (count + 1) % (MAX_COUNT + 1);
        localStorage.setItem(card.id, count);

        badge.textContent = LABELS[count];
        container.className = `card count-${count}`;
        updateSummary();
    });

    return container;
}

function updateSummary() {
    const cards = document.querySelectorAll(".card");
    const owned = document.querySelectorAll(".card:not(.count-0)");
    const totalCards = cards.length;
    const ownedCards = owned.length;

    document.getElementById("totalCount").textContent = totalCards;
    document.getElementById("ownedCount").textContent = ownedCards;
    document.getElementById("ownedRate").textContent = totalCards === 0 ? "0" : (ownedCards / totalCards * 100).toFixed(1);
    document.querySelectorAll(".series-summary").forEach(summary => {
        const series = summary.dataset.series;
        const game = summary.dataset.game;
        const cards = document.querySelectorAll(`.card[data-game="${game}"][data-series="${series}"]`);
        const owned = document.querySelectorAll(`.card[data-game="${game}"][data-series="${series}"]:not(.count-0)`);
        const total = cards.length;
        const count = owned.length;
        const rate = total === 0 ? 0 : (count / total * 100).toFixed(1);
        summary.textContent = `所持 ${count} / ${total} (${rate}%)`;
    });
}
