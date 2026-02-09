const livros = [
    {
        titulo: "O Hobbit",
        autor: "J.R.R. Tolkien",
        capa: "imagens/ohobbit.jpg",
        lido: true
    },
    {
        titulo: "O eterno marido",
        autor: "Fiódor Dostoiévski",
        capa: "imagens/marido.jpg",
        lido: false
    },
    {
        titulo: "Razão e sensibilidade",
        autor: "Jane Austen",
        capa: "imagens/jane.jpg",
        lido: false
    },
    {
        titulo: "Dom Casmurro",
        autor: "Machado de Assis",
        capa: "imagens/domcasmurro.jpg",
        lido: true
    }
];

let db;

// abrir/criar banco
const request = indexedDB.open("BibliotecaDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    // cria a "tabela" (store) se não existir
    if (!db.objectStoreNames.contains("livros")) {
        db.createObjectStore("livros", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    carregarLivrosDoBanco();
};


const lista = document.getElementById("listaLivros");
const inputTitulo = document.getElementById("titulo");
const inputAutor = document.getElementById("autor");
const inputCapa = document.getElementById("capa");
const btnSalvar = document.getElementById("salvar");
const btnAdicionar = document.getElementById("btnAdicionar");
const formulario = document.getElementById("formulario");

btnAdicionar.addEventListener("click", () => {
    formulario.style.display = "block";
});


function salvarLivrosNoBanco() {
    const transaction = db.transaction(["livros"], "readwrite");
    const store = transaction.objectStore("livros");

    store.clear();

    livros.forEach((livro) => {
        store.add(livro);
    });
}

function carregarLivrosDoBanco() {
    const transaction = db.transaction(["livros"], "readonly");
    const store = transaction.objectStore("livros");
    const request = store.getAll();

    request.onsuccess = function () {
        if (request.result.length > 0) {
            livros.length = 0; // limpa o array
            request.result.forEach(livro => livros.push(livro));
        }
        renderizarLivros();
    };
}


// read
function renderizarLivros() {
    lista.innerHTML = "";

    livros.forEach((livro, index) => {
        const card = document.createElement("div");
        card.className = "livro-card" + (livro.lido ? " lido" : "");

        card.innerHTML = `
            <div class="livro-capa">
                <img src="${livro.capa}" alt="Capa do livro ${livro.titulo}">
            </div>
            <div class="livro-info">
                <h2>${livro.titulo}</h2>
                <p class="autor">${livro.autor}</p>
                <span class="status ${livro.lido ? "lido" : "nao-lido"}">
                    ${livro.lido ? "Lido" : "Não lido"}
                </span>
                <button class="btn-marcar" onclick="alternarStatus(${index})">
                    ${livro.lido ? "Marcar como não lido" : "Marcar como lido"}
                </button>
                <span class="material-symbols-outlined icone-excluir" onclick="confirmarExclusao(${index})">delete</span>
            </div>
        `;

        lista.appendChild(card);
    });
}


// update
function alternarStatus(index) {
    livros[index].lido = !livros[index].lido;
    renderizarLivros();
    salvarLivrosNoBanco();
}


// delete
function confirmarExclusao(index) {
    const resposta = confirm("Tem certeza de que deseja excluir este livro?");
    if (resposta) {
        livros.splice(index, 1);
        salvarLivrosNoBanco();
        renderizarLivros();
    }
}


// create
btnSalvar.addEventListener("click", () => {
    const titulo = inputTitulo.value;
    const autor = inputAutor.value;
    const arquivo = inputCapa.files[0];

    if (!titulo || !autor || !arquivo) {
        alert("Preencha todos os campos!");
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function (e) {
        livros.push({
            titulo: titulo,
            autor: autor,
            capa: e.target.result,
            lido: false
        });

        salvarLivrosNoBanco();
        renderizarLivros();

        // limpar formulário
        inputTitulo.value = "";
        inputAutor.value = "";
        inputCapa.value = "";
    };

    leitor.readAsDataURL(arquivo);
});