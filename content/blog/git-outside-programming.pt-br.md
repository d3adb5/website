+++
draft = false
date  = 2022-06-18

title    = "Usando Git para além de programação"
subtitle = "Como trabalho colaborativo se beneficia (e muito) do Git"

toc = false
+++

É de conhecimento público que versionamento é importante quando escrevemos
qualquer tipo de documento, seja código-fonte escrito em uma linguagem de
programação, rascunhos de um livro, ou atas de reunião. O GitHub, por exemplo,
usa Git para _a política do site, documentação,_ e seu _roadmap,_ nenhum dos
quais envolve ou foca em programação. Mas e se a gente não liga muito para o
versionamento em si?

Manter um histórico de versões de uma obra não é algo que nos vem naturalmente,
especialmente se você é do tipo que não quer mostrar no que está trabalhando
para ninguém até o momento em que está perfeitamente contente com o resultado.
Nós esquecemos do simples fato de que o histórico nos serve muito mais do que
qualquer outra coisa: você teve uma ideia para lidar com uma limitação X?
_Anota em algum lugar!_

Para programadores, aplicar o Git em qualquer projeto é trivial e não requer
esforço. O fato é que é necessário um bom entendimento da ferramenta para
explorar o seu verdadeiro potencial, e para aqueles que não programam e que
nunca tiveram contato com Git, a linha de comando é a maior barreira de
entrada. Por que tentar aprender que botões apertar quando o _Google Docs_ me
deixa só digitar o que eu quero e automaticamente salva o histórico de
mudanças? Isso não me é legal. Bacana que a ferramenta faz isso para você, mas
e quanto a _colaborar em paralelo_ com outras pessoas que trabalham de maneiras
e em ritmos diferentes?

## Trabalhando no seu próprio ritmo

Git tem controle descentralizado, o que significa que você pode ter múltiplos
repositórios de onde puxar mudanças ao mesmo tempo. Cada um conterá objetos do
Git criados por aqueles que têm poder de escrita sobre o repositório, e os
_mantenedores_ de cada um podem decidir que objetos importar de outros lugares
para fazer _mesclagem_ a qualquer momento e de qualquer jeito. Não há real
controle, o que é bem libertador, nos permitindo manter diferentes versões até
mesmo do repositório em si.

Combinado com o fato do Git ser capaz de mesclar históricos que se separaram há
um tempo arbitrariamente longo, contanto que consígamos resolver conflitos que
surgirem, isso permite que um bocado de gente trabalhe em seus próprios
repositórios e no seu próprio ritmo:

- Tem um time trabalhando na escrita de artigos para a seção A do site? Eles
  podem ter um fork deles para trabalhar, e periodicamente pedir aos
  mantenedores do repositório principal que puxem mudanças para o site em si.

- Alguém de fora do projeto quer fazer uma contribuição? Eles podem criar um
  fork do repositório, fazer suas mudanças nele, e enviar um pedido de pull da
  mesma maneira que um membro do projeto. Seu time pode revisar as mudanças e
  quem sabe este alguém não se torna parte do time no futuro?

- Uma parte do projeto vai demorar semanas para ficar pronta, e outras pessoas
  querem focar em algo não relacionado? Deixe que aconteça tudo em paralelo e
  lide com os conflitos de mesclagem depois! O Git vai ajudar a mesclar o
  trabalho todo.

Esse site, apesar de pessoal, é versionado com Git e se qualquer um quiser
adicionar alguma coisa, pode sempre enviar um Pull Request no GitHub. Não é
nenhum Wikipedia ou site de notícias, mas tem louco para tudo.

## Tirando a interface do caminho

A resposta para o problema de não-programadores acharem difícil usar Git é
simples: criar uma interface amigável que usa o Git por trás para
versionamento. Você nunca vai alcançar a flexibilidade de usar o Git
diretamente, então deixe que os mantenedores do repositório que gruda tudo o
façam.

GitHub, GitLab, e outras suítes têm interfaces Web para uso do Git para
propósito geral, enquanto ferramentas de wiki como Wiki.js permitem o uso do
Git como módulo de armazenamento ou como real plano de fundo da operação. Estes
projetos permitem criar usuários de Git que nem se tocam do que estão usando, e
para alguns servem como porta de entrada para uso direto da ferramenta depois.

Sou do tipo que patrocina ou faz esse tipo de coisa eu mesmo? Não. Se você sabe
que existe e vê os benefícios em potencial, que aprenda a usar, eu diria. Soa
como uma atitude arrogante, mas eu tenho certeza de que a principal razão para
não-programadores não usarem Git nos seus projetos é o fato de _não saberem que
existe._
