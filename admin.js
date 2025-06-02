const USERNAME = "admin";
const PASSWORD = "1234";

function getValutazioni() {
  const saved = localStorage.getItem("valutazioni");
  return saved ? JSON.parse(saved) : { film: [], serie: [], musica: [] };
}

function saveValutazioni(data) {
  localStorage.setItem("valutazioni", JSON.stringify(data));
}

function createStarRating(voto) {
  // voto da 1 a 10, 1 voto = 0.5 stelle, max 5 stelle
  const fullStars = Math.floor(voto / 2);
  const halfStar = voto % 2 === 1 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  let stars = "";
  for(let i=0; i<fullStars; i++) stars += "★";
  if(halfStar) stars += "☆"; // mezzo stella (puoi usare un carattere speciale o svg)
  for(let i=0; i<emptyStars; i++) stars += "✩";
  return stars;
}

// -------------------- LOGIN --------------------

document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (u === USERNAME && p === PASSWORD) {
    document.getElementById('login-section').classList.add("hidden");
    document.getElementById('admin-buttons').classList.remove("hidden");
  } else {
    alert("Credenziali errate.");
  }
});

// -------------------- NAV BUTTONS --------------------

document.getElementById('btn-add').addEventListener('click', () => {
  nascondiSezioni();
  document.getElementById('admin-add').classList.remove("hidden");
});

document.getElementById('btn-remove').addEventListener('click', () => {
  nascondiSezioni();
  document.getElementById('admin-remove').classList.remove("hidden");
  mostraRimozione();
});

document.getElementById('btn-modify').addEventListener('click', () => {
  nascondiSezioni();
  document.getElementById('admin-modify').classList.remove("hidden");
  mostraModificaLista();
});

document.getElementById('btn-upload').addEventListener('click', () => {
  nascondiSezioni();
  document.getElementById('admin-upload').classList.remove("hidden");
});

// Nasconde tutte le sezioni di admin tranne i pulsanti
function nascondiSezioni() {
  document.getElementById('admin-add').classList.add("hidden");
  document.getElementById('admin-remove').classList.add("hidden");
  document.getElementById('admin-modify').classList.add("hidden");
  document.getElementById('admin-upload').classList.add("hidden");
  // reset moduli, nascondi form modifica
  document.getElementById('valutazione-form').reset();
  document.getElementById('modify-form').classList.add("hidden");
}

// -------------------- AGGIUNGI --------------------

const categoriaSelect = document.getElementById('categoria');
const albumTracksSection = document.getElementById('album-tracks-section');
const tracksContainer = document.getElementById('tracks-container');
const addTrackBtn = document.getElementById('add-track-btn');

function creaTrackInput(nome = "", durata = "", voto = "", commento = "") {
  const div = document.createElement("div");
  div.classList.add("track-input");

  div.innerHTML = `
    <input type="text" placeholder="Nome brano" class="track-name" value="${nome}" required />
    <input type="text" placeholder="Durata (es. 3:45)" class="track-duration" value="${durata}" required />
    <input type="number" placeholder="Voto (1-10)" min="1" max="10" class="track-voto" value="${voto}" required />
    <input type="text" placeholder="Commento" class="track-commento" value="${commento}" />
    <button type="button" class="remove-track-btn">❌</button>
  `;
  div.querySelector(".remove-track-btn").addEventListener("click", () => {
    div.remove();
  });

  return div;
}

categoriaSelect.addEventListener("change", () => {
  if (categoriaSelect.value === "musica") {
    albumTracksSection.classList.remove("hidden");
  } else {
    albumTracksSection.classList.add("hidden");
    tracksContainer.innerHTML = "";
  }
});

addTrackBtn.addEventListener("click", () => {
  const newTrack = creaTrackInput();
  tracksContainer.appendChild(newTrack);
});

document.getElementById('valutazione-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const categoria = categoriaSelect.value;
  const titolo = document.getElementById('titolo').value.trim();
  const voto = parseInt(document.getElementById('voto').value);
  const commento = document.getElementById('commento').value.trim();

  if (!titolo || voto < 1 || voto > 10) {
    alert("Inserisci titolo e voto validi.");
    return;
  }

  let nuovoElemento = { titolo, voto, commento };

  if (categoria === "musica") {
    const tracks = [];
    const trackDivs = tracksContainer.querySelectorAll(".track-input");
    if (trackDivs.length === 0) {
      alert("Aggiungi almeno un brano all'album.");
      return;
    }
    for (const div of trackDivs) {
      const nome = div.querySelector(".track-name").value.trim();
      const durata = div.querySelector(".track-duration").value.trim();
      const votoBrano = parseInt(div.querySelector(".track-voto").value);
      const commentoBrano = div.querySelector(".track-commento").value.trim();

      if (!nome || !durata || isNaN(votoBrano) || votoBrano < 1 || votoBrano > 10) {
        alert("Compila correttamente tutti i campi dei brani.");
        return;
      }
      tracks.push({ nome, durata, voto: votoBrano, commento: commentoBrano });
    }
    nuovoElemento.brani = tracks;
  }

  const valutazioni = getValutazioni();
  valutazioni[categoria].push(nuovoElemento);
  saveValutazioni(valutazioni);

  alert("Valutazione aggiunta!");
  e.target.reset();
  tracksContainer.innerHTML = "";
  albumTracksSection.classList.add("hidden");
});

// -------------------- RIMUOVI --------------------

function mostraRimozione() {
  const dati = getValutazioni();
  const sezioni = {
    film: document.getElementById("lista-film"),
    serie: document.getElementById("lista-serie"),
    musica: document.getElementById("lista-musica")
  };

  for (const categoria in sezioni) {
    sezioni[categoria].innerHTML = `<h3>${categoria.toUpperCase()}</h3>`;
    dati[categoria].forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "remove-item";
      div.innerHTML = `
        <span>${item.titolo}</span>
        <button onclick="rimuoviValutazione('${categoria}', ${index})">Rimuovi</button>
      `;
      sezioni[categoria].appendChild(div);
    });
  }
}

window.rimuoviValutazione = function(categoria, index) {
  if (!confirm("Sei sicuro di voler rimuovere questa voce?")) return;
  const dati = getValutazioni();
  dati[categoria].splice(index, 1);
  saveValutazioni(dati);
  mostraRimozione();
};

// -------------------- MODIFICA --------------------

function mostraModificaLista() {
  const dati = getValutazioni();
  const sezioni = {
    film: document.getElementById("mod-film"),
    serie: document.getElementById("mod-serie"),
    musica: document.getElementById("mod-musica")
  };

  for (const categoria in sezioni) {
    sezioni[categoria].innerHTML = "";
    dati[categoria].forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "modify-item";
      div.innerHTML = `
        <span>${item.titolo}</span>
        <button data-cat="${categoria}" data-index="${index}">Modifica</button>
      `;
      sezioni[categoria].appendChild(div);
    });
  }

  // Event listener per ogni bottone modifica
  document.querySelectorAll("#mod-film button, #mod-serie button, #mod-musica button").forEach(btn => {
    btn.addEventListener("click", apriModuloModifica);
  });
}

function apriModuloModifica(e) {
  const categoria = e.target.getAttribute("data-cat");
  const index = parseInt(e.target.getAttribute("data-index"));
  const dati = getValutazioni();
  const elemento = dati[categoria][index];

  document.getElementById("modify-categoria").value = categoria;
  document.getElementById("modify-index").value = index;
  document.getElementById("modify-titolo").value = elemento.titolo;
  document.getElementById("modify-voto").value = elemento.voto;
  document.getElementById("modify-commento").value = elemento.commento;

  const tracksSection = document.getElementById("modify-tracks-section");
  const tracksContainer = document.getElementById("modify-tracks-container");
  tracksContainer.innerHTML = "";

  if (categoria === "musica" && elemento.brani && elemento.brani.length > 0) {
    tracksSection.classList.remove("hidden");
    for (const brano of elemento.brani) {
      const div = creaTrackInput(brano.nome, brano.durata, brano.voto, brano.commento);
      tracksContainer.appendChild(div);
    }
  } else {
    tracksSection.classList.add("hidden");
  }

  document.getElementById("modify-form").classList.remove("hidden");
}

const modifyAddTrackBtn = document.getElementById("modify-add-track-btn");
const modifyTracksContainer = document.getElementById("modify-tracks-container");
modifyAddTrackBtn.addEventListener("click", () => {
  const newTrack = creaTrackInput();
  modifyTracksContainer.appendChild(newTrack);
});

document.getElementById("modify-form").addEventListener("submit", e => {
  e.preventDefault();

  const categoria = document.getElementById("modify-categoria").value;
  const index = parseInt(document.getElementById("modify-index").value);
  const titolo = document.getElementById("modify-titolo").value.trim();
  const voto = parseInt(document.getElementById("modify-voto").value);
  const commento = document.getElementById("modify-commento").value.trim();

  if (!titolo || voto < 1 || voto > 10) {
    alert("Inserisci titolo e voto validi.");
    return;
  }

  let nuovoElemento = { titolo, voto, commento };

  if (categoria === "musica") {
    const tracks = [];
    const trackDivs = modifyTracksContainer.querySelectorAll(".track-input");
    if (trackDivs.length === 0) {
      alert("Aggiungi almeno un brano all'album.");
      return;
    }
    for (const div of trackDivs) {
      const nome = div.querySelector(".track-name").value.trim();
      const durata = div.querySelector(".track-duration").value.trim();
      const votoBrano = parseInt(div.querySelector(".track-voto").value);
      const commentoBrano = div.querySelector(".track-commento").value.trim();

      if (!nome || !durata || isNaN(votoBrano) || votoBrano < 1 || votoBrano > 10) {
        alert("Compila correttamente tutti i campi dei brani.");
        return;
      }
      tracks.push({ nome, durata, voto: votoBrano, commento: commentoBrano });
    }
    nuovoElemento.brani = tracks;
  }

  const dati = getValutazioni();
  dati[categoria][index] = nuovoElemento;
  saveValutazioni(dati);

  alert("Valutazione modificata!");
  mostraModificaLista();
  document.getElementById("modify-form").classList.add("hidden");
});

// -------------------- CARICAMENTO DA FILE --------------------

const fileInput = document.getElementById("file-input");
const uploadConfirmBtn = document.getElementById("upload-confirm-btn");

uploadConfirmBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Seleziona un file JSON.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const datiCaricati = JSON.parse(e.target.result);

      if (!datiCaricati.film || !datiCaricati.serie || !datiCaricati.musica) {
        alert("Formato JSON errato. Devono esserci film, serie e musica.");
        return;
      }

      // Validazione base degli elementi
      ["film", "serie", "musica"].forEach(cat => {
        if (!Array.isArray(datiCaricati[cat])) {
          throw new Error(`${cat} deve essere un array.`);
        }
      });

      const dati = getValutazioni();

      // Aggiungo i nuovi dati
      dati.film = dati.film.concat(datiCaricati.film);
      dati.serie = dati.serie.concat(datiCaricati.serie);
      dati.musica = dati.musica.concat(datiCaricati.musica);

      saveValutazioni(dati);
      alert("Valutazioni caricate con successo!");
      fileInput.value = "";
    } catch (err) {
      alert("Errore nel file JSON: " + err.message);
    }
  };
  reader.readAsText(file);
});
