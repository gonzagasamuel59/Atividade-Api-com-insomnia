const API_URL = "http://localhost:3000/jogos";


const listaJogos = document.getElementById("listaJogos");

const pesquisa = document.getElementById("pesquisa");

const filtroStatus = document.getElementById("filtroStatus");

const formJogo = document.getElementById("formJogo");

const titulo = document.getElementById("titulo");

const genero = document.getElementById("genero");

const plataforma = document.getElementById("plataforma");

const nota = document.getElementById("nota");

const status = document.getElementById("status");

const mensagem = document.getElementById("mensagem");

const btnSalvar = document.getElementById("btnSalvar");

const btnCancelar = document.getElementById("btnCancelar");



let jogoEditando = null;

let jogos = [];


async function carregarJogos() {

    try {

        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Erro ao acessar a API.");
        }

        jogos = await resposta.json();

        console.log("Jogos recebidos:", jogos);

        atualizarDashboard();

        mostrarJogos();

    } catch (erro) {

        console.error("Erro ao carregar jogos:", erro);

        listaJogos.innerHTML = `
            <p>
                Não foi possível conectar com a API.
                Verifique se o JSON Server está funcionando.
            </p>
        `;
    }
}


function mostrarJogos() {

    const textoPesquisa = pesquisa.value.toLowerCase();

    const statusSelecionado = filtroStatus.value;


    const jogosFiltrados = jogos.filter(function(jogo) {

        const tituloJogo =
            String(jogo.titulo || "").toLowerCase();


        const correspondePesquisa =
            tituloJogo.includes(textoPesquisa);


        const correspondeStatus =
            statusSelecionado === "Todos" ||
            jogo.status === statusSelecionado;


        return correspondePesquisa && correspondeStatus;

    });


    listaJogos.innerHTML = "";


    if (jogosFiltrados.length === 0) {

        listaJogos.innerHTML = `
            <p>Nenhum jogo encontrado.</p>
        `;

        return;
    }


    jogosFiltrados.forEach(function(jogo) {

        const card = document.createElement("div");

        card.className = "card-jogo";


        card.innerHTML = `

            <h3>${jogo.titulo || "Sem título"}</h3>

            <p>
                <strong>Gênero:</strong>
                ${jogo.genero || "Não informado"}
            </p>

            <p>
                <strong>Plataforma:</strong>
                ${jogo.plataforma || "Não informado"}
            </p>

            <p class="nota">
                 Nota: ${jogo.nota ?? "Não informada"}
            </p>

            <span class="status">
                ${jogo.status || "Não informado"}
            </span>

            <div class="botoes">

                <button
                    class="btn-editar"
                    onclick="editarJogo('${jogo.id}')">
                    Editar
                </button>

                <button
                    class="btn-excluir"
                    onclick="excluirJogo('${jogo.id}')">
                    Excluir
                </button>

            </div>

        `;


        listaJogos.appendChild(card);

    });

}


function atualizarDashboard() {

    const total = jogos.length;


    const quantidadeJogando = jogos.filter(function(jogo) {

        return jogo.status === "Jogando";

    }).length;


    const quantidadeFinalizados = jogos.filter(function(jogo) {

        return jogo.status === "Finalizado";

    }).length;


    document.getElementById("totalJogos").innerText = total;

    document.getElementById("jogando").innerText =
        quantidadeJogando;

    document.getElementById("finalizados").innerText =
        quantidadeFinalizados;

}


pesquisa.addEventListener("input", function() {

    mostrarJogos();

});



filtroStatus.addEventListener("change", function() {

    mostrarJogos();

});



formJogo.addEventListener("submit", async function(event) {

    event.preventDefault();


    const jogo = {

        titulo: titulo.value.trim(),

        genero: genero.value.trim(),

        plataforma: plataforma.value.trim(),

        nota: Number(nota.value),

        status: status.value

    };



    if (jogo.titulo === "") {

        mensagem.innerText =
            "Digite o título do jogo.";

        return;
    }


    if (jogo.genero === "") {

        mensagem.innerText =
            "Digite o gênero do jogo.";

        return;
    }


    if (jogo.plataforma === "") {

        mensagem.innerText =
            "Digite a plataforma do jogo.";

        return;
    }


    if (nota.value === "") {

        mensagem.innerText =
            "Digite uma nota.";

        return;
    }


    if (jogo.nota < 0 || jogo.nota > 10) {

        mensagem.innerText =
            "A nota precisa estar entre 0 e 10.";

        return;
    }


    if (jogo.status === "") {

        mensagem.innerText =
            "Selecione o status do jogo.";

        return;
    }


    try {

        let resposta;


        if (jogoEditando !== null) {

            resposta = await fetch(
                `${API_URL}/${jogoEditando}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(jogo)

                }
            );


            if (!resposta.ok) {

                throw new Error(
                    "Erro ao editar jogo."
                );

            }


            mensagem.innerText =
                "Jogo editado com sucesso!";

        }



        else {

            resposta = await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(jogo)

                }
            );


            if (!resposta.ok) {

                throw new Error(
                    "Erro ao cadastrar jogo."
                );

            }


            mensagem.innerText =
                "Jogo cadastrado com sucesso!";

        }


        formJogo.reset();



        jogoEditando = null;


        btnSalvar.innerText =
            "Cadastrar jogo";


        document.getElementById(
            "tituloFormulario"
        ).innerText =
            "Cadastrar novo jogo";


        btnCancelar.style.display =
            "none";



        await carregarJogos();


    } catch (erro) {

        console.error(erro);

        mensagem.innerText =
            "Não foi possível realizar a operação.";

    }

});



async function editarJogo(id) {

    try {

        const resposta =
            await fetch(`${API_URL}/${id}`);


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar jogo."
            );

        }


        const jogo =
            await resposta.json();


        titulo.value =
            jogo.titulo || "";

        genero.value =
            jogo.genero || "";

        plataforma.value =
            jogo.plataforma || "";

        nota.value =
            jogo.nota ?? "";

        status.value =
            jogo.status || "";


        jogoEditando = id;



        document.getElementById(
            "tituloFormulario"
        ).innerText =
            "Editar jogo";


        btnSalvar.innerText =
            "Salvar alterações";


        btnCancelar.style.display =
            "block";



        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    } catch (erro) {

        console.error(erro);

        mensagem.innerText =
            "Não foi possível carregar o jogo para edição.";

    }

}


btnCancelar.addEventListener("click", function() {

    formJogo.reset();


    jogoEditando = null;


    btnSalvar.innerText =
        "Cadastrar jogo";


    document.getElementById(
        "tituloFormulario"
    ).innerText =
        "Cadastrar novo jogo";


    btnCancelar.style.display =
        "none";


    mensagem.innerText = "";

});



async function excluirJogo(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este jogo?"
        );


    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await fetch(
                `${API_URL}/${id}`,
                {

                    method: "DELETE"

                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao excluir jogo."
            );

        }


        mensagem.innerText =
            "Jogo excluído com sucesso!";



        await carregarJogos();


    } catch (erro) {

        console.error(erro);

        mensagem.innerText =
            "Não foi possível excluir o jogo.";

    }

}




carregarJogos();