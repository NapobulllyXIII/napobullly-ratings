function showSection(section) {
  document.getElementById('film').style.display = section === 'film' ? 'block' : 'none';
  document.getElementById('series').style.display = section === 'series' ? 'block' : 'none';
  document.getElementById('musica').style.display = section === 'musica' ? 'block' : 'none';
}

document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("recensioniData")) || {
    film: [],
    series: [],
    musica: []
  };

  generaValutazioni('film', 'film-container');
  generaValutazioni('series', 'serie-container');
  generaValutazioni('musica', 'musica-container');

  function generaValutazioni(categoria, containerId) {
    const container = document.getElementById(containerId);
    const valutazioni = data[categoria];
    if (!container || !valutazioni) return;
    container.innerHTML = "";
    valutazioni.forEach(item => {
      const card = document.createElement("div");
      card.className = "valutazione-card";
      card.innerHTML = `
        <h3>${item.titolo}</h3>
        <p><strong>Voto:</strong> ${item.voto}</p>
        <p>${item.commento || ""}</p>
      `;
      container.appendChild(card);
    });
  }
});
