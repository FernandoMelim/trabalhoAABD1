// BUSCA UM
document.getElementById("buscaUm").addEventListener("click", function () {
    var resultado = document.getElementById("resultados");
    resultado.innerHTML = '';

    db.collection('partidas').get().then(partidas => {
        partidas.forEach(partida => {
            // Repare que no cloud firestore não é possível fazer um distinct na hora de buscar os resultados. Nesse caso, mapas repetidos serão buscados.
            // Para fazer um distinct, isso teria que ser feito pela aplicação
            partida.data().mapa.get().then(mapa => {
                resultado.innerHTML += 'Nome: ' + mapa.id + ' Tipo: ' + mapa.data().tipoDeMapa.id + '<br><br>';

            });
        });
    });
});

// BUSCA DOIS
document.getElementById("buscaDois").addEventListener("click", async function () {
    let resultado = document.getElementById("resultados");
    resultado.innerHTML = '';
    let idJogador = '/jogadores/Enzo';
    let totalMinutos = 0;

    // Pega id da equipe do enzo. Sei que tem apenas uma pois um jogador só pode fazer parte de uma equipe.
    let equipeEnzo = await db.collection('equipes')
        .where("jogadores.jogadorTres", "==", db.doc(idJogador))
        .get();

    let idEquipeEnzo = equipeEnzo.docs[0].id;

    //Pega as partidas que a equipe do enzo jogou
    let partidas1 = await db.collection('partidas')
        .where("equipes.timeUm", '==', db.doc('/equipes/' + idEquipeEnzo))
        .get();

    let partidas2 = await db.collection('partidas')
        .where("equipes.timeDois", '==', db.doc('/equipes/' + idEquipeEnzo))
        .get();

    //Faz o cálculo
    partidas1.forEach(partida => {
        totalMinutos += partida.data().duracao;
    });

    partidas2.forEach(partida => {
        totalMinutos += partida.data().duracao;
    });

    resultado.innerHTML = totalMinutos;
});

// BUSCA 3
document.getElementById("buscaTres").addEventListener("click", async function () {
    let resultado = document.getElementById("resultados");
    resultado.innerHTML = '';
    let paiNId = 'paiN';
    let c9Id = 'C9';

    let partidas1 = await db.collection('partidas')
        .where("equipes.timeUm", '==', db.doc('/equipes/' + paiNId))
        .where("equipes.timeDois", '==', db.doc('/equipes/' + c9Id))
        .get();

    let partidas2 = await db.collection('partidas')
        .where("equipes.timeUm", '==', db.doc('/equipes/' + c9Id))
        .where("equipes.timeDois", '==', db.doc('/equipes/' + paiNId))
        .get();


    let partidas = partidas1.docs.concat(partidas2.docs);

    partidas.forEach(partida => {
        resultado.innerHTML += 'Partida Id: ' + partida.id + '<br>';
        resultado.innerHTML += 'Duração: ' + partida.data().duracao + 'min. <br>';
        resultado.innerHTML += 'Placar: ' + partida.data().placar + '<br>';
        resultado.innerHTML += 'Vencedor: ' + partida.data().vencedor.id + '<br>';
        resultado.innerHTML += '<br><br>'
    });

    console.log(partidas);
});

// BUSCA 4
document.getElementById("buscaQuatro").addEventListener("click", async function () {
    var resultado = document.getElementById("resultados");
    resultado.innerHTML = '';

    // Para essa busca será necessário criar um índice composto no firebase.
    // Estrutura do índice: 
    // temEquipe - crescente
    // idade - crescente
    // A ordem que os campos são inseridos no índice importa e a ordenação deles também.
    // Se o índice fosse criado com o campo 'idade' em forma decrescente, 
    // essa consulta não funcionaria por causa do orderBy que é feito de forma ascendente.
    // Se o campo 'idade' fosse criado na frente do campo 'temEquipe', a ordem dos campos na consulta teria que ser invertida para ela funcionar.
    let jogadores = await db.collection('jogadores').where("temEquipe", "==", true).where("idade", "<", 18).orderBy("idade", "asc").get();

    jogadores.forEach(jogador => {
        resultado.innerHTML += 'Nome: ' + jogador.id + ' - Idade: ' + jogador.data().idade + '. <br><br>'
    });
});

// BUSCA 5
document.getElementById("buscaCinco").addEventListener("click", async function () {
    var resultado = document.getElementById("resultados");
    resultado.innerHTML = '';

    let partida = await db.collection('partidas').orderBy('duracao', 'desc').limit(1).get();
    resultado.innerHTML += 'Id da partida: ' + partida.docs[0].id + ' - Duração: ' + partida.docs[0].data().duracao + 'min. <br><br>'

});

// BUSCA 6
document.getElementById("buscaSeis").addEventListener("click", async function () {
    var resultado = document.getElementById("resultados");
    resultado.innerHTML = '';

    let partida = await db.collection('partidas').orderBy('duracao', 'desc').limitToLast(1).get();
    resultado.innerHTML += 'Id da partida: ' + partida.docs[0].id + ' - Duração: ' + partida.docs[0].data().duracao + 'min. <br><br>'
});

// BUSCA 7
document.getElementById("buscaSete").addEventListener("click", async function () {
    var resultado = document.getElementById("resultados");
    resultado.innerHTML = '';
    let healerReference = '/funcao/Healer'

    let jogadores = await db.collection('jogadores').where("funcao", "==", db.doc(healerReference)).get();

    jogadores.forEach(jogador => {
        resultado.innerHTML += 'Nome: ' + jogador.id + ' Idade: ' + jogador.data().idade + ' Tem equipe: ' + (jogador.data().temEquipe ? "Sim" : "Não") + ' <br><br>'
    });
});

// BUSCA 8
document.getElementById("buscaOito").addEventListener("click", async function () {
    var resultado = document.getElementById("resultados");
    resultado.innerHTML = '';
    let supportReference = '/funcao/Suporte'

    // Nesse caso não pode ser feita uma busca do tipo .where("funcao", "!=", db.doc(supportReference)).where('idade', '>', 20).orderBy('idade', 'asc') de forma direta
    // pois quando envolve inequação(operadores !=, <, >, <=, >=) a consulta só pode ser feita em cima de um campo. Nesse caso a consulta envolveria 2 campos
    // e o firestore não permite isso
    // Nesse caso, infelizmente, não é possível fazer um filtro em apenas uma query.
    // É preciso fazer um filtro em uma query, um filtro em outra query e fazer o merge dos resultados pela aplicação.
    let jogadoresNaoSuporteQuery = await db.collection('jogadores').where("funcao", "!=", db.doc(supportReference)).get();
    let jogadoresAcimaDeVinteAnosQuery = await db.collection('jogadores').where('idade', '>', 20).orderBy('idade', 'asc').get();
    let jogadoresNaoSuporte = jogadoresNaoSuporteQuery.docs;
    let jogadoresAcimaDeVinteAnos = jogadoresAcimaDeVinteAnosQuery.docs;

    let jogadores = [];

    // Fazendo merge dos resultados
    for (let i = 0; i < jogadoresAcimaDeVinteAnos.length; i++) {
        for (let j = 0; j < jogadoresNaoSuporte.length; j++) {
            if (jogadoresNaoSuporte[j].id == jogadoresAcimaDeVinteAnos[i].id)
                jogadores.push(jogadoresAcimaDeVinteAnos[i]);
        }
    }


    jogadores.forEach(jogador => {
        resultado.innerHTML += 'Nome: ' + jogador.id + ' Idade: ' + jogador.data().idade + ' Tem equipe: ' + (jogador.data().temEquipe ? "Sim" : "Não");
        resultado.innerHTML += ' Função: ' + jogador.data().funcao.id + ' <br><br>'
    });
});

// BUSCA 9
document.getElementById("buscaNove").addEventListener("click", async function () {
    var resultado = document.getElementById("resultados");
    resultado.innerHTML = '';

    let times = await db.collection('equipes').get();

    times.docs.forEach(async function (time) {
        let jogadores = [
            time.data().jogadores.jogadorUm,
            time.data().jogadores.jogadorDois,
            time.data().jogadores.jogadorTres,
            time.data().jogadores.jogadorQuatro,
            time.data().jogadores.jogadorCinco,
        ]

        var jogadorMaisVelho = await retornaJogadorMaisVelho(jogadores);

        resultado.innerHTML += 'Nome do time: ' + time.id + ' Nome do integrante: ' + jogadorMaisVelho.id + ' Idade do integrante: ' + jogadorMaisVelho.data().idade + ' <br><br>'
    })

});

async function retornaJogadorMaisVelho(jogadores) {
    var jogadorUm = await jogadores[0].get();
    var jogadorDois = await jogadores[1].get();
    var jogadorTres = await jogadores[2].get();
    var jogadorQuatro = await jogadores[3].get();
    var jogadorCinco = await jogadores[4].get();

    jogadores = [
        jogadorUm,
        jogadorDois,
        jogadorTres,
        jogadorQuatro,
        jogadorCinco
    ]

    jogadores.sort(function (a, b) {
        return (a.data().idade > b.data().idade) ? 1 : ((b.data().idade > a.data().idade) ? -1 : 0);
    });

    return jogadores[4];
}

// BUSCA 10
document.getElementById("buscaDez").addEventListener("click", async function () {
    var resultado = document.getElementById("resultados");
    resultado.innerHTML = '';

    let times = await db.collection('equipes').get();

    times.docs.forEach(async function (time) {
        
        let jogadores = [
            await time.data().jogadores.jogadorUm.get(),
            await time.data().jogadores.jogadorDois.get(),
            await time.data().jogadores.jogadorTres.get(),
            await time.data().jogadores.jogadorQuatro.get(),
            await time.data().jogadores.jogadorCinco.get()
        ]
        resultado.innerHTML += 'Time: ' + time.id + '<br>';
        resultado.innerHTML += 'Jogadores: <br>';
        resultado.innerHTML += ' Nome do integrante: ' + jogadores[0].id + ' Idade do integrante: ' + jogadores[0].data().idade + ' Função: ' + jogadores[0].data().funcao.id + '<br>';
        resultado.innerHTML += ' Nome do integrante: ' + jogadores[1].id + ' Idade do integrante: ' + jogadores[1].data().idade + ' Função: ' + jogadores[1].data().funcao.id + '<br>';
        resultado.innerHTML += ' Nome do integrante: ' + jogadores[2].id + ' Idade do integrante: ' + jogadores[2].data().idade + ' Função: ' + jogadores[2].data().funcao.id + '<br>';
        resultado.innerHTML += ' Nome do integrante: ' + jogadores[3].id + ' Idade do integrante: ' + jogadores[3].data().idade + ' Função: ' + jogadores[3].data().funcao.id + '<br>';
        resultado.innerHTML += ' Nome do integrante: ' + jogadores[4].id + ' Idade do integrante: ' + jogadores[4].data().idade + ' Função: ' + jogadores[4].data().funcao.id + '<br>';
        resultado.innerHTML += ' ------------------------------- <br><br>'

    });
});