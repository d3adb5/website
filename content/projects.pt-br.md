---
draft: false
date: 2023-03-06

title: Projetos pessoais, pet projects, projetos paralelos, etc.
subtitle: Basicamente coisas nas quais estou envolvido, de um jeito ou de outro!

navigation:
  index: 2
  right: false
  title: Projetos

extensions:
  - flickity
---

Listados fora de qualquer ordem em particular, aqui estão algumas das coisas
nas quais trabalhei, de alguma forma, que considero merecedoras de algum
destaque. Para cada projeto citado, adicionarei uma breve descrição do mesmo,
ou do meu envolvimento nele caso não seja originalmente meu.

Comecemos com projetos _pessoais_ no _GitHub!_ Dos projetos sob minha tutela,
estes compõem a maioria, já que a maior parte dos projetos de software livre e
open source é hospedada no GitHub --- para o bem ou para o mal --- e é lá que
eu hospedo os meus também. Para cada repositório, as linguagens utilizadas
estão listadas abaixo da descrição do projeto, em ordem de mais utilizada para
menos utilizada. Estas aparecem como detectadas pelo GitHub e portanto podem
haver divergências.

**DISCLAIMER:** Há um pouco de JavaScript nesta página como resultado de uma
tentativa de criar um carrossel de projetos do GitHub que ficasse bonito, mas a
página deve funcionar bem sem ele também. _Sinta-se livre para fazer scroll ou
arrastar (também funciona):_

{{< flickity >}}
  {{< github path="d3adb5/smarky" >}}
  {{< github path="d3adb5/helm-unittest-action" >}}
  {{< github path="d3adb5/website" >}}
  {{< github path="d3adb5/dotfiles" >}}
  {{< github path="d3adb5/devops-playground" >}}
  {{< github path="d3adb5/st" >}}
  {{< github path="d3adb5/scripts" >}}
  {{< github path="d3adb5/brainfuck" >}}
{{< / flickity >}}

O número de estrelas nesses repositórios é um pouco baixo, não? Se você acha
que lhe podem ser úteis ou que são interessantes, _por favor considere dar uma
estrelinha no GitHub!_ Me dá aquele boost no ego e me mostra que outras pessoas
se interessam pelo menos um pouquinho pelo que ando produzindo.

Tenho, claro, outros repositórios que não estão listados aqui, seja porque são
privados ou porque não achei que mereciam parar nessa página. Falarei sobre os
repositórios privados mais adiante. Primeiro, _aqui estão projetos para os
quais contribuí no GitHub,_ junto do meu envolvimento em cada um:

{{< flickity >}}
  {{< github
    path="stakater/reloader"
    description="Algumas PRs mergeadas, consertando problemas tanto no Reloader quando em seu Helm chart."
  >}}
  {{< github
    path="profclems/glab"
    description="Adicionei uma feature que permite especificar o nome do remote ao criar um repositório no GitLab. Este projeto virou oficial!"
  >}}
  {{< github
    path="xmonad/xmonad-contrib"
    description="Adicionei alguns módulos que escrevi e fiz mudanças em alguns já existentes! XMonad é minha escolha de gerenciador de janelas."
  >}}
  {{< github
    path="stakater/application"
    description="Introduzi testes unitários, refatorei o chart, e revisei PRs. A Stakater acabou me adicionando como maintainer!"
  >}}
  {{< github
    path="kolbusa/stalonetray"
    description="Adicionei uma feature para ignorar ícones baseado nas classes de janela, e refatorei o módulo de configuração por completo."
  >}}
  {{< github
    path="mumble-voip/mumble-docker"
    description="Simplifiquei o script de entrypoint da imagem deles, usando mais features de Bash e aumentando a legibilidade."
  >}}
  {{< github
    path="binbashar/terraform-aws-tfstate-backend"
    description="Adicionei suporte total à v4 do AWS provider para Terraform, e uma feature para geração automática de configuração backend."
  >}}
  {{< github
    path="lucasoshiro/oshit"
    description="Reimplementação do Git em Haskell. Sou responsável pelos testes, pipeline de CI, e grandes refatorações da codebase."
  >}}
  {{< github
    path="screensy/screensy"
    description="Traduzi a interface do screensy para Português Brasileiro."
  >}}
  {{< github
    path="vaugusto92/cpp-assert"
    description="Adicionei workflows de CI e melhorei a estrutura do projeto e o processo de build com GNU Make."
  >}}
  {{< github
    path="viniciustrainotti/terraform-aws-static-website-module"
    description="Ajudei com o desenvolvimento inicial, revisando PRs, e com suporte a múltiplos domínios e versões do Terraform."
  >}}
  {{< github
    path="taksan/xwiki-helm"
    description="Adicionei CI com GitHub Actions e fiz melhorias ao Helm chart."
  >}}
  {{< github
    path="soarqin/ReGBA"
    description="Adicionei suporte aos botões de gatilho como representados no handheld PlayGo."
  >}}
  {{< github
    path="Hilbertmf/8bitsFightClub"
    description="Enviei uma PR mudando a estrutura do projeto, adicionando um arquivo POM, e uma pipeline de CI."
  >}}
{{< / flickity >}}

Estou deixando de fora alguns repositórios antigos e repositórios que já foram
deletados.

## Repositórios privados

Dá para dizer que a maior parte da minha atividade no GitHub é privada. Isto
não se deve ao trabalho, já que a empresa para a qual trabalho não usa o
GitHub, mas sim porque há no entremeio informações que eu gostaria de manter
privadas. Exemplos desse tipo de informação são endereços IP e nomes de domínio
de máquinas virtuais que tenho expostas à Internet.

Bom, aqui vai uma lista:

{{< flickity >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/services"
    description="Configuração Ansible para gerenciar e fazer deploy de serviços nos meus servidores. CI/CD feito via GitHub Actions."
    languages="Ansible, GitHub Actions"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/dmenu"
    description="Fork do dmenu, usando libxcb em vez da Xlib. Alguns patches populares foram aplicados e estão sendo mantidos."
    languages="C, Makefile"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/cmddisplay"
    description="Uma biblioteca para criação e manipulação de displays virtuais na linha de comando. Destinada a alguns estudantes."
    languages="C, Makefile"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/deskbot"
    description="Um bot modular de IRC escrito do zero em Python. Tinha como intuito aprender a linguagem de um jeito produtivo."
    languages="Python"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/discord-bot"
    description="Um bot modular de Discord escrito usando a discord.py. Capaz de gerenciar canais e fazer scaling com múltiplas contas de bot."
    languages="Python"
  >}}
  {{< project-card
    github="d3adb5"
    project="d3adb5/ahk"
    description="Uma coleção de scripts AutoHotKey, de quando usava Windows 7. Tive de aprender sobre APIs obscuras do Windows aqui."
    languages="AutoHotkey"
  >}}
{{< / flickity >}}

Alguns destes projetos já não mais mantidos, mas estão registrados aqui para a
posteridade.

## Outros projetos

Também sou listado como co-autor de alguns commits aceitos na staging do
_subsistema IIO do Linux!_ Os detalhes: os commits adicionam arrays contendo
IDs de dispositivos Open Firmware que alguns drivers de dispositivos da Analog
devem suportar, além de uma macro para simplificar a especificação de canais de
capacitância. Tenho meus colegas do grupo de extensão a agradecer por isso, já
que eu nunca havia considerado contribuir para o kernel antes.

Um hobby meu desde 2016 é reutilizar os laptops antigos da minha família como
_servidores domésticos_ para rodar serviços úteis como Pihole, Syncthing,
Transmission, Plex, Kodi, entre outros. É uma boa forma de dar nova vida a
máquinas antigas, e é um projeto divertido.

Por hoje é tudo --- estou obviamente excluindo daqui projetos nas empresas para
as quais trabalhei, _por medo de quebrar NDAs._ Grande parte do meu dia-a-dia
no trabalho envolve Kubernetes, Jenkins, Terraform, AWS, e por aí vai. _Entre
em contato_ se quiser saber mais!
