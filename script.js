const predefinite = {
  film: [
    { titolo: "Inception", voto: 9, commento: "Un capolavoro visivo e narrativo." }
  ],
  serie: [
    { titolo: "Dark", voto: 9, commento: "Complessissima ma brillante." }
  ],
  musica: [
    {
      titolo: "Abbey Road - The Beatles",
      voto: 10,
      commento: "Senza tempo.",
      brani: [
        { titolo: "Come Together", voto: 9, durata: "4:20" },
        { titolo: "Something", voto: 10, durata: "3:03" },
        { titolo: "Oh! Darling", voto: 8, durata: "3:26" }
      ]
    }
  ]
};

function getValutazioni() {
  const salvate = localStorage.getItem("valutazioni");
  const dati = salvate ? JSON.parse(salvate) : { film: [], serie: [], musica: [] };
  for (let cat of ["film", "serie", "musica"]) {
    if (!dati[cat]) dati[cat] = [];
    dati[cat] = [...predefinite[cat], ...dati[cat]];
  }
  return dati;
}

function creaCard(item, categoria) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>${item.titolo}</h3>
    <p><strong>Voto:</strong> ${item.voto}/10</p>
    <p>${item.commento}</p>
  `;
  if (categoria === 'musica' && item.brani) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => mostraPopup(item));
  }
  return card;
}

function mostraPopup(album) {
  const popup = document.getElementById("popup");
  const titolo = document.getElementById("popup-titolo");
  const lista = document.getElementById("popup-brani");

  titolo.textContent = album.titolo;
  lista.innerHTML = "";
  album.brani.forEach(b => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${b.titolo}</strong> – voto: ${b.voto}/10 – durata: ${b.durata}`;
    lista.appendChild(li);
  });

  popup.classList.remove("hidden");
}

document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("popup").classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("popup").classList.add("hidden");
  generaValutazioni('film', 'film-container');
  generaValutazioni('serie', 'serie-container');
  generaValutazioni('musica', 'musica-container');
});

function generaValutazioni(categoria, containerId) {
  const container = document.getElementById(containerId);
  const valutazioni = getValutazioni();
  valutazioni[categoria].forEach(item => {
    const card = creaCard(item, categoria);
    container.appendChild(card);
  });
}
