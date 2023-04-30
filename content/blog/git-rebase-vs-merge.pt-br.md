---
draft: false
date: 2022-05-13

title: "Histórico linear com Git: rebase, merge, squash"
subtitle: Rebase ou não, eis a questão...

toc: false
---

**DISCLAIMER:** Não me declaro exímio conhecedor de Git, muito menos alguém
extremamente experiente com ferramentas de controle de versão. Este artigo está
sendo escrito enquanto decido o que quero para os meus próprios projetos, e
como enxergo a aplicação de cada "filosofia", por assim dizer. O tema é
controverso de maneiras que até me fugiam da cabeça.

_Observação:_ Assume-se aqui um conhecimento decente de Git e de sua
terminologia. Alguns comandos serão exibidos, mas explicações sobre o que é
`commit`, `branch`, etc. não estarão presentes. Links para documentação serão
inseridos de forma branda.

## O que é um histórico linear?

O histórico de commits de um repositório é dito linear (às vezes semi-linear)
quanto não há caminhos paralelos de desenvolvimento com mudanças visíveis. Ou
seja, tais mudanças seguem uma ordem estrita, se não cronológica, ao menos
sequencial. Em palavras mais sucintas, dá para seguir o histórico de `commit`s
sem precisar dividir a leitura em "galhos" (`branch`) em nenhum momento.

Exemplo de um histórico linear:

```
* a64cdd6 feat(bar): extend new feature
* 8bce4d5 feat(bar): introduce new feature
* 12757f0 feat(foo): send processed info to server
* f26b0a5 feat(foo): process some information
* 3016bae chore: starting this repository
```

Claramente as commits seguem uma ordem direta: `3016bae`, depois `f26b0a5`, e
por aí vai até chegarmos à commit `a64cdd6`. Perfeito para entendermos a
evolução do projeto, se pudermos contar com o fato das mensagens de commit
resumirem bem o propósito das mudanças que introduzem.

Projetos, mesmo de pequena escala, costumam implementar fluxos de trabalho que
--- ao menos no papel --- seguem a máxima de "crie `commit`s frequentemente, e
para cada _feature_, um `branch`". Um `git merge` aqui e ali, e criamos um
"mapa do metrô" no nosso histórico.

Se tentamos preservar a linearidade em casos como o descrito, antes de cada
`merge` possivelmente virá um `rebase`. No final, preferindo uma `commit` de
_merge_ a um _fast-forward_, nosso histórico toma a aparência outrora chamada
de semi-linear:

```
*   1d26fed merge: feature/bar into master
|\
| * be56591 feat(bar): extend new feature
| * ad2cf56 feat(bar): introduce new feature
|/
*   189e487 merge: feature/foo into master
|\
| * 36d49e6 feat(foo): send processed info to server
| * 1528f6c feat(foo): process some information
|/
* 3ad35f0 chore: starting this repository
```

Apesar de tecnicamente existirem caminhos paralelos, por via de regra somente
um deles faz mudanças, enquanto o outro é um elo direto entre a _base_ do
caminho significativo, e o seu ponto final. Sendo assim, não perdemos a
capacidade de seguir as mudanças feitas na árvore de arquivos em sequência.

Para tal, basta "planificar" o histórico acima. O resultado, sem contar os
hashes de cada _commit_, é o mesmo do primeiro histórico apresentado. Os
níveis, caminhos, camadas, como queira chamar, servem o papel de identificar,
com uma olhada rápida, o começo e o final de cada _super-etapa_ do processo de
desenvolvimento, ou pelo menos os momentos em que paramos para revisar o que
fizemos.

### Mapa do metrô

Para quem não o conhece por esse nome, o seguinte exemplo configura o tipo de
histórico que chamamos de "mapa do metrô":

```
*   1805ccb merge: bar into master
|\
| * 9232bac feat(bar): more stuff
| * 87ddf92 feat(bar): do stuff
* | 2cb78b7 something changed again
* |   1e7e0e8 merge: foo into master
|\ \
| * | 4b0d990 feat(foo): add something else
| * | 51fb8b4 feat(foo): something something
| |/
* / 26339fc whoops, something changed here
|/
* f51dc43 chore: start
```

Perceba como fica difícil de ler o histórico como uma sequência bem ordenada
das mudanças feitas no código. Não que isso não seja possível ou a maneira
correta de usar o Git: muito pelo contrário, o Git foi feito com a capacidade
de ligar diferentes ramos de desenvolvimento em mente, já que muitas pessoas
trabalhando numa mesma árvore de arquivos não podem sempre parar para atualizar
seus históricos locais. Em vez disso, trabalha-se na esperança de que no final
não haverão _conflitos de merge_.

## Qual o sentido do histórico para você? E o Git?

Antes de entrar no assunto de vantagens e desvantagens de um histórico linear,
acho necessário tratar do propósito do histórico de commits, que, querendo ou
não, tem um aspecto subjetivo. Apesar do Git ser um software de controle de
versão, a pergunta _"Que versões estamos guardando?"_ é mais do que pertinente.

Veja algumas possíveis respostas:

- Toda versão do código guardada por um desenvolvedor quando considerou as
  mudanças suficientes para criar uma commit.
- Toda versão do código que passa nos testes automatizados.
- Todo o trajeto de desenvolvimento do projeto, lido ou não de forma sequencial.
- Tudo que acharmos ser pertinente, mesmo que falhe nos testes, na compilação,
  ou até em seu funcionamento.

Talvez a intenção de cada resposta se explique pela intenção no uso do Git.
Queremos preservar a história como ela realmente ocorreu, ou queremos elaborar
uma história de desenvolvimento enxuta e compreensível? Se encontramos um bug,
caçamos a mudança que introduziu o bug usando `git bisect` e testes
automatizados, ou só procuramos o pedaço de código que está causando problemas?

**Na minha opinião,** o histórico mostra a evolução do projeto e não o
envolvimento de cada desenvolvedor. Digo isso porque vejo o histórico de
mudanças como parte da documentação, e um documento com seções semelhantes
espalhadas em 30 folhas de papel é mais difícil de ler do que se tais seções
fossem aglutinadas em uma só lista.

O ideal é que nenhuma commit introduza erros, e hooks do Git podem ser usados
para rodar testes antes de criar commits novas, mas na realidade, seja por
descuido, por capricho, ou por conta do `rebase`, frequentemente criamos
commits que deixam os testes a desejar. [Este artigo][stop-using-rebase]
explica uma das desvantagens de se usar o comando `git rebase`, mas o faz do
ponto de vista de quem usar o Git para descobrir a origem de algum erro, ou
como uma "rede de segurança".

Pergunto ao leitor:

1. Defensores da estratégia de _merge_ afirmam que são poucas as pessoas que
   sabem usar o comando _rebase_. Quantas pessoas você conhece que sabem não só
   da existência do _bisect_, mas também como o usar?

2. Usar o Git como ferramenta de debug depende não só de um teste bem escrito
   para o _bisect_, que é compatível até o seu ponto de partida, mas também de
   desenvolvedores que testam suas alterações antes de fazer qualquer commit.
   Isso lhe parece uma situação comum?

3. Defensores da estratégia de _merge_ afirmam que fazer _rebase_ é "reescrever
   a história". De fato o é, mas se a história envolve alterações que quebram o
   processo de build ou de teste, o _bisect_ não iria nos falhar de qualquer
   forma?

4. Podemos fazer _squash_ das commits antes delas serem incorporadas e garantir
   que funcionem, gerando maior confiança no _bisect_, mas... isso não é
   reescrever a história do mesmo jeito?

É um artigo bem escrito e que traz um argumento interessante, mas que apela
para uma competência maior do que a necessária para fazer um mero _rebase_. E
afinal, se todo desenvolvedor testasse suas alterações antes de criar commits,
_por que teríamos builds de CI?_

[stop-using-rebase]: https://medium.com/@fredrikmorken/why-you-should-stop-using-git-rebase-5552bee4fed1

## Situações práticas

Parece uma perspectiva pessimista e até arrogante, mas a maioria dos
desenvolvedores, independente da empresa, criará commits sem fazer testes, sem
revisar as próprias mudanças, sem atualizar o seu histórico local antes de
criar seu _branch_. Não pense nisso como uma crítica, pois quem vos fala é
culpado dos mesmos pecados. Em vez disso, enxergue minhas palavras como
paráfrase do ditado "errar é humano".

Partindo deste mútuo entendimento de que "vamos fazer besteira", é possível
imaginar as situações reais que podem surgir ao aplicar uma estratégia sobre a
outra, e inclusive dar nomes aos resultados:

1. _Vale-tudo, caos,_ ou _dura realidade:_ preservar a história como ela é,
   mantendo qualquer alteração feita pelo desenvolvedor, mesmo que seu branch
   comece 80 commits atrás, e 80% das alterações a serem incorporadas são para
   a resolução de conflitos. Como não há _squash_ e talvez nem builds de CI,
   não é possível garantir que toda commit do repositório passe na fase de
   testes.

   - **Não** dá para ler o histórico sequencialmente.
   - **Não** dá para encontrar erros facilmente com _bisect_.
   - A história de cada desenvolvedor é _preservada_.

2. _Mudanças espremidas_ ou _bombas de código:_ fazer _squash_ das commits
   antes de cada _merge_, com branches que podem ter partido de qualquer
   situação, já que ao final somente uma commit será incorporada. Assuma que
   builds de CI garantem que cada commit, que passa a ser uma bomba de código de
   potencialmente milhares de linhas, passe na fase de testes.

   - _Dá_ para ler o histórico sequencialmente, **mas** com bombas de código.
   - _Dá_ para encontrar erros com _bisect_, **mas** eles se escondem em grandes
     diffs.
   - A história de cada desenvolvedor **não** é preservada.

3. _Linearidade ainda que tardia:_ fazer um _rebase_ antes de cada merge,
   garantindo que as mudanças a serem incorporadas possam partir da versão mais
   recente do seu destino, mesmo que isso signifique abandonar commits que antes
   passariam na fase de testes sem problemas.

   - _Dá_ para ler o histórico sequencialmente.
   - _Dá_ para encontrar erros com _bisect_, **mas** com chance de falsos
     positivos.
   - A história de cada desenvolvedor **não** é preservada.

4. _Ditadura do teste automático:_ linearidade já não é mais o foco, e sim a
   aprovação de **toda** commit na fase de testes. O desenvolvedor é obrigado a
   garantir que toda commit sendo enviada passe na fase de testes, e que não há
   conflitos de _merge_. Sob a pressão de não mostrar fraqueza e ser chamado de
   imbecil, ele faz todas as alterações de que precisa de uma vez só e roda os
   testes antes de enviar a sua única singela commit, que poderia muito bem ter
   sido resultado de um _squash_ no momento da incorporação, como é o caso na
   situação 2.

   - _Dá_ para ler o histórico sequencialmente, **mas** com grandes chances de
     ver bombas de código.
   - _Dá_ para encontrar erros com _bisect_, **mas** eles vão quase que de certo
     se esconder em grandes diffs.
   - A história de cada desenvolvedor _é apavorante, mas preservada._

No momento estou apostando na situação 3 como a menos ruim.
