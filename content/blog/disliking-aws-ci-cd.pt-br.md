---
draft: false
date: 2023-05-16

title: Descobri que desgosto da stack de CI/CD da AWS
subtitle: Tentativas frustradas de usar AWS CodeCommit, CodeBuild, e CodePipeline

tags: [ DevOps, Tecnologia, CI/CD ]

toc: true
---

O objetivo original deste artigo era documentar as minhas aventuras usando a
suíte de serviços de CI/CD oferecidas pela AWS. No entanto, conforme eu
encontrava empecilhos durante a implementação, ele foi se transformando em uma
espécie de desabafo sobre o quão imaturos eles são. Muito do que havia sido
escrito até eu decidir _desistir da prova de conceito_ foi mantido como estava.
O restante foi adaptado para o que você está prestes a ler.

Há pouco tempo eu fiz um simulado do exame para a certificação _AWS Certified
DevOps Engineer Professional,_ feito pela própria AWS. As perguntas se
mostraram desafiadoras, provavelmente devido à minha experiência prática com a
AWS até poucos meses atrás se resumir à manutenção de instâncias EC2 e clusters
EKS/ECS, enquanto as perguntas do exame abordavam bastante os serviços de CI/CD
que a AWS oferece. **No fim, só 50% das minhas respostas estavam corretas.**

Como forma de estudar e compensar a falta de experiência, decidi experimentar
com o _AWS CodeCommit, CodeBuild_ e _CodePipeline_ por conta própria ao ver
como seria usá-los em alguns dos meus projetos pessoais. _Meu plano inicial_
era escolher alguns projetos pessoais com requisitos diferentes, reproduzi-los
usando os serviços mencionados, e então escrever sobre minha experiência e
fazer uma comparação superficial entre usar exclusivamente a AWS e
exclusivamente o GitHub ou GitLab e seus serviços integrados. **Minha
conclusão: mantenha-se nestes se puder.**

## O preço de seguir os meus passos

Neste momento em que vos escrevo, todos os serviços mencionados oferecem um
_free tier_ suficiente para que você possa experimentá-los pelo menos uma vez.
Contudo, _este artigo não é um guia,_ e se você seguir todos os passos aqui
descritos à risca, só vai acabar perdendo tempo e ficando frustrado, pois
**também abordarei meus erros.** Caso você possa usar o _free tier_ e realmente
deseja experimentar estes serviços, tudo o que posso dizer é que não tive
nenhum custo associado ao que aqui está documentado.

Um pouco da minha frustração pode ser atribuída ao fato de eu _insistir em usar
o Terraform_ sem recorrer a módulos de terceiros. Se você não se importa em
usar o console da AWS, recomendo que o faça a menos que você já esteja
familiarizado com ambos AWS e Terraform.

## Considerações iniciais e sinais vermelhos

A AWS é uma plataforma com uma tonelada de serviços diferentes, e não uma suíte
de Git. Implementar uma suíte de Git do zero não é uma tarefa fácil, mas a AWS
fez o seu trabalho ficar ainda mais difícil ao decidir integrar seus novos
produtos com os serviços já existentes. Botando tudo no papel, eles fizeram um
trabalho impressionante, mas a sua experiência (de usuário) não será tão suave
quanto seria no GitHub ou GitLab.

A seguir estão algumas observações que podem ser consideradas positivas,
negativas, ou neutras, a depender do seu ponto de vista:

- _Usuários do AWS CodeCommit são usuários IAM._ Ao contrário do GitHub e
  GitLab, todas as contas pertencem à mesma conta: a sua conta da AWS. As
  permissões são gerenciadas através de políticas IAM, e chaves SSH são
  adicionadas através do console do IAM.
- _Chaves SSH usadas no AWS CodeCommit não podem ser do tipo ED25519,_ apesar
  de instâncias EC2 darem suporte à cifra de curva elíptica. Chaves SSH
  públicas precisam ser do tipo RSA ou PEM para serem usadas com o serviço, o
  que exclui chaves ED25519.
- _O nome de usuário para SSH não é `'git'`, mas sim um ID de chave aleatório,_
  gerado após você adicionar a chave à sua conta IAM. A alternativa seria
  restringir chaves a uma única conta, já que a chave serviria como identidade.
- _Repositórios são criados em regiões específicas,_ em vez de existirem
  globalmente. Isso é evidenciado na URL usada para clonar o repositório, e
  pode ter sido feito por questões de conformidade legal.
- _O CodeBuild e o CodePipeline contam como usuários do CodeCommit,_ já que
  assumem uma identidade na AWS ao acessarem repositórios, e portanto se
  encaixam na definição de usuário ativo. Já mencionei que você precisa
  gerenciar estas permissões?
- _Você não pode só adicionar um arquivo para rodar builds automaticamente,_
  você vai ter que usar o EventBridge para capturar eventos do CodeCommit e,
  dependendo do que você quer fazer, funções Lambda podem ser sua única opção.
- _Pipelines do CodePipeline operam em um branch fixo,_ o que significa que você
  pode acabar criando pipelines quase idênticas dependendo do seu fluxo de
  trabalho. Nem o Jenkins é tão inflexível nesse ponto.

Eu não tinha conhecimento de nada disso quando embarquei nessa jornada. Estes
foram apenas os primeiros sinais de que eu não teria uma boa experiência. Pelo
menos não se eu já tivesse usado GitHub Actions, GitLab CI/CD ou Jenkins antes.
**Estas ferramentas têm suas próprias falhas e limitações,** e algumas não são
pequenas, mas para a maioria dos casos de uso, eu ainda escolheria qualquer
delas em vez dos serviços da AWS.

## Configurando um usuário para o AWS CodeCommit

Como já mencionado, _usuários do CodeCommit são usuários IAM,_ então a primeira
coisa a ser feita é criar um usuário que tenha acesso ao serviço, ou conceder
tal acesso a um usuário existente, que foi o que eu fiz. Aqui vai um aviso
antes de você criar um monte de usuários para um cenário hipotético: o _free
tier_ do CodeCommit permite até 5 usuários ativos, definidos da seguinte forma:

> Um usuário ativo é uma identidade AWS (usuário/role IAM, usuário federado, ou
> conta root) único, que acessa repositórios do AWS CodeCommit durante o mês,
> seja através de requisições Git ou usando o console de gerenciamento da AWS.
> Um servidor acessando o CodeCommit usando uma identidade AWS única conta como
> um usuário ativo.

Então não há razão para se preocupar tendo menos de 5 usuários ativos segundo a
definição acima. Para evitar lidar com políticas inline, eu _criei um grupo
chamado CodeTools,_ ao qual adicionei a política _AWSCodeCommitPowerUser,_ que
dá acesso total ao CodeCommit, com exceção da permissão para deletar
repositórios. Mais políticas pré-definidas podem ser adicionadas ao grupo
conforme necessário.

O próximo passo é ir ao console do IAM e adicionar uma _chave pública SSH para
AWS CodeCommit_ ao usuário IAM que será usado. Note que a chave **deve ser do
tipo RSA ou estar no formato PEM.** Não era o meu caso inicialmente, então
apenas gerei uma nova chave RSA:

```sh
$ ssh-keygen -t rsa  # a pubkey gerada estará em ~/.ssh/id_rsa.pub
```

Normalmente, ao se autenticar via SSH com qualquer suíte Git, você usaria `git`
como nome de usuário e a chave em si serviria como sua identidade. No entanto,
para o CodeCommit você precisará usar o _ID da chave SSH_ adicionada ao usuário
IAM. Ele é gerado quando você adiciona a chave através do console. Consulte
[esta parte da documentação][aws-codecommit-ssh] para mais detalhes.

[aws-codecommit-ssh]: https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-ssh-unixes.html#setting-up-ssh-unixes-keys

## Compilando minha configuração do XMonad na AWS

O repositório que estou tentando hospedar na AWS é o
[d3adb5/dotfiles][gh-dotfiles], atualmente hospedado no GitHub e com uma
pipeline de CI configurada através do GitHub Actions. Os requisitos para que
este experimento seja considerado um sucesso são:

- O repositório é hospedado no AWS CodeCommit.
- Quando uma pull request for criada ou atualizada, a AWS rodará a pipeline de
  CI.
- A pipeline de CI deve ser capaz de restaurar dependências entre builds por
  meio de cache.

O seguinte código em Terraform foi usado para provisionar o repositório:

```hcl
resource "aws_codecommit_repository" "dotfiles" {
  repository_name = "dotfiles"
  description     = "Configuration files for the set of programs I use daily."
}

output "clone_url_ssh" {
  description = "URL used to clone the repository using SSH."
  value       = aws_codecommit_repository.dotfiles.clone_url_ssh
}
```

Como o repositório foi criado na região `us-west-2`, os URLs para cloná-lo
usarão o domínio _git-codecommit.us-west-2.amazonaws.com._

[gh-dotfiles]: https://github.com/d3adb5/dotfiles

### Enviando commits ao AWS CodeCommit

Eu gosto de usar nomes curtos e convenientes para hosts SSH em vez de URLs
inteiros, então adicionei o seguinte ao meu `~/.ssh/config`:

```ssh-config
Host aws
  Hostname git-codecommit.us-west-2.amazonaws.com
  User IDDAMINHACHAVESSH
```

Em seguida, configurei o repositório remoto e enviei o branch `master`:

```bash
git remote add aws aws:/v1/repos/dotfiles
git push aws master
```

E voilà! Nós agora podemos ver o repositório no console do CodeCommit:

{{< figure
  src="/media/aws-codecommit-dotfiles-1.webp"
  link="/media/aws-codecommit-dotfiles-1.webp"
  alt="AWS CodeCommit mostrando os arquivos no branch principal."
>}}

Sim, eu tentei fazer _push_ para `git@git-codecommit.us-west-2.amazonaws.com`
no começo. Peço-lhe um desconto, estou aprendendo as coisas da maneira difícil
em vez de seguir um tutorial, curso, ou lendo páginas de documentação antes de
mais nada.

### Abrindo uma pull request

Já que o "novo" repositório usará exclusivamente os serviços da AWS, nossa
primeira pull request removerá o workflow do GitHub Actions. Primeiro, criemos
um novo branch para nossas mudanças e o enviemos para o CodeCommit após
criarmos novos commits:

```bash
git switch -c aws/remove-github-directory
git rm -r .github
git commit
git push aws
```

Eu esperava ver uma mensagem com um URL para abrir uma pull request, mas o
CodeCommit nem isso fez. GitHub e GitLab o fazem sem necessidade de quaisquer
partes extras, então fiquei um pouco decepcionado.

Abrir uma pull request é trivial, se você quiser clicar no console do
CodeCommit, mas se, como eu, você prefere usar a linha de comando, é possível
fazê-lo através do AWS CLI. Ele não consegue inferir nenhuma informação do
repositório em que você está, como as ferramentas CLI oficiais do GitHub e
GitLab fazem, então você precisará fornecer, _no mínimo,_ um título, o nome do
repositório e os branches de origem e base:

```bash
aws codecommit create-pull-request \
  --title "Remove GitHub Actions workflow" \
  --targets repositoryName=dotfiles,sourceReference=aws/remove-github-directory,destinationReference=master
```

O comando acima assume que você configurou o AWS CLI para usar o usuário IAM
configurado para o CodeCommit e para usar a região da AWS onde o repositório
foi adicionado. Uma versão completa do comando usaria a flag `--region` e
talvez `--profile` para se referir às credenciais apropriadas.

Espera-se algo assim o console da AWS se tudo ocorreu como esperado:

{{< figure
  src="/media/aws-codecommit-dotfiles-2.webp"
  link="/media/aws-codecommit-dotfiles-2.webp"
  alt="É assim que nossa pull request se mostra no console do CodeCommit."
>}}

### Criando uma pipeline de CI

Este é o desafio verdadeiro. Com GitHub Actions, GitLab CI/CD e Bitbucket
Pipelines, tudo que você precisa fazer é adicionar os arquivos certos com os
nomes certos ao repositório e eles serão automaticamente lidos pela suíte e
enviados para uma fila para serem consumidos pelos agentes de build. Vamos,
então, revisar o único job em nosso workflow atual do GitHub Actions:

```yaml
name: XMonad
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v3
  - uses: haskell/actions/setup@v2
    with:
      enable-stack: true
      stack-version: latest
      stack-no-global: true
  - uses: actions/cache@v3
    with:
      path: ~/.stack
      key: stack-global-${{ hashFiles('xmonad/stack.yaml') }}
      restore-keys: stack-global-
  - uses: actions/cache@v3
    with:
      path: xmonad/.stack-work
      key: stack-work-${{ hashFiles('xmonad/stack.yaml') }}-${{ hashFiles('**/*.hs') }}
      restore-keys: stack-work-
  - run: sudo apt-get install -y libx11-dev libxft-dev libxinerama-dev libxrandr-dev libxss-dev
  - run: cd xmonad && stack build
```

Os nomes de steps e as linhas em branco foram removidas para encurtar o trecho
acima. O que o YAML acima nos diz é que:

1. Este job será executado em um runner rodando a _última versão do Ubuntu._
2. Nós faremos _checkout_ do repositório através de `actions/checkout`,
3. Configuraremos a toolchain de Haskell com a última versão do Stack,
4. Instalaremos as bibliotecas necessárias pelas dependências do XMonad, e
5. Entraremos no diretório do XMonad e construiremos o projeto.

Adicionalmente, através da action `actions/cache`, estamos dizendo ao GitHub
Actions que:

- _Antes do passo 4,_ tente restaurar as dependências e instalações do GHC
  armazenadas em cache.
- _Depois do passo 5,_ armazene as dependências e instalações do GHC em cache.

Como podemos reproduzir o comportamento acima com as ferramentas _AWS Code\*_?
Mais importante, de quais ferramentas nós realmente precisamos?

#### Usando CodePipeline do jeito errado

A distinção entre _CodePipeline_ e _CodeBuild_ não estava imediatamente clara
para mim. Julgando pelo nome e por alguns artigos sobre pipelines de CI/CD na
AWS, assumi que o CodePipeline seria um produto de pipeline de automação geral
--- algo parecido com o Jenkins --- e que o CodeBuild seria usado pelo
CodePipeline para os stages de build. _Embora o último possa ser o caso às
vezes,_ o CodeBuild pode ser usado por si só para integração contínua.

Sem saber disso, tentei criar e escrever uma pipeline. Para construir o código,
é necessário um projeto CodeBuild, algo que pode ser criado automaticamente
pela AWS ao se criar uma pipeline através do console. No entanto, aqui estamos
provisionando todo recurso via Terraform, então vamos começar:

```terraform
resource "aws_codepipeline" "dotfiles" {
  name     = "dotfiles-ci"
  role_arn = aws_iam_role.codepipeline.arn

  stage {
    name = "Source"
    action {
      name     = "Source"
      category = "Source"
      # ...
    }
  }

  stage {
    name = "Build"
    action {
      name     = "Build"
      category = "Build"
      # ...
    }
  }
}
```

A pipeline que estamos definindo precisa apenas de dois stages: fazer checkout,
construir o projeto. Ao contrário dos stages arbitrários de pipeline do Jenkins
que estamos acostumados a ver, a API do CodePipeline estipula que as actions
tenham um _ActionTypeId_ especificando parâmetros que serão usados para impor
algumas restrições sobre ela. Isso deve ficar mais claro à medida que
continuamos nossa action de checkout:

```terraform
action {
  name     = "Source"
  category = "Source"
  provider = "CodeCommit"
  owner    = "AWS"
  version  = "1"

  configuration = {
    RepositoryName = aws_codecommit_repository.dotfiles.repository_name
    BranchName     = "master"
  }
}
```

Parece bom o suficiente, certo? Talvez possamos **especificar qual branch nós
queremos construir** quando iniciarmos uma pipeline. Isso _não é possível_ no
momento, razão pela qual escolher o CodePipeline foi um erro. De qualquer
jeito, vamos para a action de build. Ela pode ser definida da seguinte maneira,
e podemos criar um `buildspec.yml` depois:

```terraform
action {
  name     = "Build"
  category = "Build"
  provider = "CodeBuild"
  owner    = "AWS"
  version  = "1"

  configuration = {
    ProjectName = aws_codebuild_project.dotfiles.name
  }
}
```

Precisamos de um projeto no CodeBuild, como você pode inferir lendo o trecho
acima. Felizmente, criar um projeto CodeBuild é _trivial, mas cobriremos isso
depois,_ quando tocarmos na solução de fato. As únicas coisas que mudam do que
você verá nas seções posteriores são que a string `"CODEPIPELINE"` é usada para
ambos os tipos de `source` e `artifacts` na declaração do projeto.

Não tão felizmente, lidar com permissões não vai ser a última coisa que você
precisará fazer nesta declaração, porque eu deixei de fora alguns argumentos
nos blocos de action acima. Acontece que a categoria não é suficiente para
dizer à AWS que você quer seu código fonte presente em estágios posteriores da
pipeline: _você precisa declarar artefatos de input e output_ para suas
actions:

```terraform
action {
  name     = "Source"
  category = "Source"
  # ...
  output_artifacts = ["source_output"]
}

action {
  name     = "Build"
  category = "Build"
  # ...
  input_artifacts = ["source_output"]
}
```

Essa noção de artefatos de entrada e saída é generalizada, no entanto, e não se
aplica apenas a levar arquivos de um estágio para outro. Consequentemente, você
precisará de um lugar para armazenar esses artefatos, pois **o CodePipeline não
fará isso por você.** Somos forçados a declarar um bloco `artifact_store`, e
atualmente o CodePipeline suporta apenas S3.

Apesar de ter dito que não usaria módulos de terceiros, abro aqui uma exceção
para declaração de um bucket S3, já que ninguém merece ter que replicar todo o
boilerplate que acompanha o `resource` do bucket:

```terraform
module "artifacts_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "3.8.2"

  bucket = "codepipeline-dotfiles-ci-artifacts"
  acl    = "private"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

E então podemos adicionar o bloco `artifact_store` à declaração da pipeline:

```terraform
artifact_store {
  location = module.artifacts_bucket.s3_bucket_id
  type     = "S3"
}
```

Foi só quando tentei disparar a pipeline ao abrir ou atualizar pull requests
que descobri que você não pode selecionar o branch que vai construir através do
CodePipeline. Dei uma chance ao CodeBuild e percebi que _ele é a ferramenta a
ser usada para integração contínua._

#### Usando o CodeBuild sozinho

Não deu certo usar o CodePipeline. No lugar, vamos usar só o _CodeBuild,_ já
que a sua API permite não só especificar a referência Git que ele vai buscar no
repositório, mas também especificar variáveis de ambiente! Há duas coisas de
que precisamos para começar: um projeto e uma especificação de build. Esta deve
ficar nos repositório e portanto será escrita mais abaixo.

Explicando de forma breve o CodeBuild: ele provisiona a infraestrutura
necessária para seguir as instruções de uma especificação de build. A
especificação de build pode vir de um arquivo `buildspec.yml` na raiz do código
fonte que é obtido quando você inicia um build através deste serviço. Em sua
essência, é bem parecido com um _workflow_ do _GitHub Actions_ no sentido de
que ele descreve os comandos a serem executados em um ambiente de build.

Como já dito anteriormente, você pode criar um projeto pelo console e ser
feliz. No entanto, _o jeito difícil é sempre mais divertido,_ então aqui está o
código Terraform que usei para criar meu projeto, depois de desistir do
CodePipeline:

```terraform
resource "aws_codebuild_project" "dotfiles" {
  name         = "dotfiles"
  service_role = aws_iam_role.codebuild.arn

  source {
    type     = "CODECOMMIT"
    location = aws_codecommit_repository.dotfiles.clone_url_http
  }

  environment {
    type         = "LINUX_CONTAINER"
    compute_type = "BUILD_GENERAL1_SMALL"
    image        = "aws/codebuild/standard:7.0"
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/dotfiles"
      stream_name = "dotfiles"
    }
  }

  artifacts {
    type = "NO_ARTIFACTS"
  }
}
```

Sim, é simples assim! **Para criar o projeto, quero dizer,** repare que no
trecho de código acima estamos nos referindo a um certo recurso
`aws_iam_role.codebuild`, mas eu não mostrei o código que o cria nem as
policies de que ele precisa! _Vamos primeiro analisar a configuração acima:_

- O projeto se chama `dotfiles` e se comunica com a AWS através de uma certa
  IAM role.
- O código fonte é obtido do nosso repositório no _AWS CodeCommit._
- O build será executado em um container Linux com _pouco_ poder de
  processamento.
- O container usará a imagem `aws/codebuild/standard:7.0`, baseada em Ubuntu.
- Logs serão escritos no _CloudWatch Logs,_ no grupo e stream dados.
- Não há artefatos a serem produzidos por este build.

[Esta seção][docs-tf-codebuild-proj] da documentação do provider AWS para
Terraform lhe dará muito mais detalhes do que posso fornecer aqui.

Algo que é interessante apontar aqui é que os recursos computacionais do
container onde o build será executado são definidos no lado do _CodeBuild_ e
não na especificação de build. _Isso significa que haverá coisas fora do nosso
repositório que afetam nosso build,_ o que é algo a se ter em mente quando se
busca por reprodutibilidade e GitOps.

[docs-tf-codebuild-proj]: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/codebuild_project

#### Escrevendo um buildspec.yml

Há espaço para melhorias aqui, incluindo usar uma imagem Docker que já conta
com a toolchain de Haskell e talvez até as dependências de que precisamos, mas
deixo isso para um momento futuro. Estamos criando uma prova de conceito, então
a otimização de custo pode esperar.

Esse é o `buildspec.yml` que escrevi para reproduzir o que hoje é feito pelo
GitHub Actions:

```yaml
version: 0.2

phases:
  install:
    commands:
      - apt-get update -y
      - apt-get install -y libx11-dev libxft-dev libxinerama-dev libxrandr-dev libxss-dev
      - curl -sSL https://get.haskellstack.org/ | sh
  pre_build:
    commands:
      - cd xmonad
      - stack build --only-dependencies
  build:
    commands:
      - stack build
```

Sinto dizer que adicionar o arquivo à staging, criando a commit e a enviando
para o branch criado anteriormente neste artigo não resulta em builds
automáticos. Além disso, observe os nomes das _phases_ no arquivo. Esses nomes
não são arbitrários, mas sim [parte da sintaxe.][buildspec-syntax]

Com este arquivo presente no branch `aws/remove-github-directory`, iniciar um
build nesse branch nos leva a um sucesso:

{{< figure
  src="/media/aws-codecommit-dotfiles-3.webp"
  link="/media/aws-codecommit-dotfiles-3.webp"
  alt="CodeBuild showing a list of successful build phases."
>}}

Já que conseguimos fazer um build com sucesso seguindo essa especificação,
_vamos fazer merge_ do nosso branch, assim a _master_ estará pronta para ser
construída a qualquer momento.

[buildspec-syntax]: https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#build-spec-ref-syntax

### Executando builds para toda pull request

Na AWS, nada é verdadeiramente simples. Não se você estiver evitando usar o
console para tudo que você faz, o que chamamos de _ClickOps._ Para fazer a
pipeline de CI executar em toda pull request, precisamos reagir a eventos do
_CodeCommit_ através do _EventBridge,_ disparando um build do _CodeBuild._

Queremos que nossa regra seja acionada quando uma pull request é criada
(`pullRequestCreated`) e quando o branch de origem (head) de uma pull request é
atualizado (`pullRequestSourceBranchUpdated`). Seguindo isso, a regra pode ser
declarada da seguinte maneira:

```terraform
resource "aws_cloudwatch_event_rule" "pull_requests" {
  name        = "dotfiles-pull-requests"
  description = "Triggered when a pull request is created or updated."

  event_pattern = jsonencode({
    detail-type = ["CodeCommit Pull Request State Change"]
    resources   = [aws_codecommit_repository.dotfiles.arn]
    detail = {
      event = ["pullRequestCreated", "pullRequestSourceBranchUpdated"]
    }
  })
}
```

O projeto do _CodeBuild_ será nosso target, e nós precisaremos transformar o
input para que a commit certa seja construída, pois caso contrário o
_CodeBuild_ vai construir a última versão do código por padrão, e nós daremos
uma estrelinha de sucesso ou alerta de falha para as PRs erradas. O target é
definido assim:

```terraform
resource "aws_cloudwatch_event_target" "codebuild" {
  rule     = aws_cloudwatch_event_rule.pull_requests.name
  arn      = aws_codebuild_project.dotfiles.arn
  role_arn = aws_iam_role.eventbridge_codebuild.arn

  input_transformer {
    input_paths    = { sourceCommit = "$.detail.sourceCommit" }
    input_template = <<-ENDOFINPUT
      {
        "sourceVersion": "<sourceCommit>"
      }
    ENDOFINPUT
  }
}
```

O _heredoc_ indentado acima é usado em vez de `jsonencode()` porque este escapa
os sinais de menor e maior que que usamos para nos referir à chave de entrada
`sourceCommit` --- resultando no _CodeBuild_ tentando buscar uma ref chamada
`<sourceCommit>`. **Falo por experiência própria.**

Da referência ao recurso _`aws_iam_role.eventbridge_codebuild.arn`_ você pode
ver que mais uma role precisa ser criada. Essa é felizmente bem simples e
precisa apenas da permissão _`codebuild:StartBuild`_ para o projeto criado
alguns passos atrás.

Com regra e target provisionados, criei um novo branch fazendo uma mudança
pequena à configuração XMonad e criei uma pull request, o que _levou a um build
acontecendo automaticamente!_ Um push subsequente confirmou que mudanças feitas
à PR também acionam novos builds.

### Obtendo aprovação do CodeBuild

Agora temos um repositório e uma pipeline. A pipeline roda toda vez que uma
pull request é aberta ou atualizada, mas do jeito que as coisas estão, _pull
requests ainda podem ser mergeadas se a pipeline falhar!_ Afinal, não há uma
relação semântica inerente entre o CodeBuild e pull requests no CodeCommit.
Além disso, aprovações no CodeCommit também são feitas de uma maneira pouco
usual. Permita-me explicar.

No CodeCommit, regras de aprovação podem ser adicionadas a pull requests
individualmente. Isso mesmo, você pode criar uma regra de aprovação para uma
pull request informando o número de aprovações necessárias e os grupos de
identidades AWS que podem conceder tais aprovações. **Você não pode criar uma
regra para o repositório!** Pelo menos não diretamente: você deve criar um
template de regra de aprovação para o CodeCommit e associá-lo ao seu
repositório.

Meu desejo é que qualquer pull request que esteja falhando o check de
integração contínua não possa ser mergeada, então criarei um template de regra
de aprovação e o associarei ao repositório `dotfiles`. Tal template requer
apenas uma aprovação, que será chamada de `built-approval`, que por sua vez
poderá ser concedida por qualquer identidade que assuma a role que o
_CodeBuild_ está usando:

```terraform
resource "aws_codecommit_approval_rule_template" "ci" {
  name        = "build-approval"
  description = "Approvals comings from CodeBuild."

  content = jsonencode({
    Version               = "2018-11-08"
    DestinationReferences = ["refs/heads/master"]
    Statements = [{
      Type                    = "Approvers"
      NumberOfApprovalsNeeded = 1
      ApprovalPoolMembers = [
        "${replace(aws_iam_role.codebuild.arn, "role", "assumed-role")}/*"
      ]
    }]
  })
}

resource "aws_codecommit_approval_rule_template_association" "ci" {
  repository_name             = aws_codecommit_repository.dotfiles.id
  approval_rule_template_name = aws_codecommit_approval_rule_template.ci.name
}
```

Finalmente, precisamos da aprovação do CodeBuild no caso de um build bem
sucedido, certo? Como eu disse, **não há relações semânticas inerentes entre
CodeBuild e CodeCommit.** Os serviços são independentes um do outro, e não há
integrações para tornar mais fácil usá-los juntos. Desde acionar builds até
prevenir merges quebrados, cabe ao usuário se virar sozinho.

O CLI da AWS vem já instalado na imagem Ubuntu que escolhi para o projeto no
CodeBuild, então depois de dar uma lida [na referência de
API][update-approval-state], pensei que aprovar a pull request poderia ser
feito com um comando como:

```bash
$ aws codecommit update-pull-request-approval-state \
    --pull-request-id $PULL_REQUEST_ID \
    --revision-id $REVISION_ID \
    --approval-state APPROVE
```

E aí eu só precisaria passar essas duas variáveis de ambiente a partir do
evento disparado pelo CodeCommit atualizando o bloco `input_transformer` na
declaração do target do EventBridge assim:

```terraform
input_transformer {
  input_paths = {
    sourceCommit  = "$.detail.sourceCommit"
    pullRequestId = "$.detail.pullRequestId"
    revisionId    = "$.detail.revisionId"
  }

  input_template = <<-ENDOFINPUT
    {
      "sourceVersion": "<sourceCommit>",
      "environmentVariablesOverride": [
        { "name": "PULL_REQUEST_ID", "value": "<pullRequestId>" },
        { "name": "REVISION_ID",     "value": "<revisionId>" }
      ]
    }
  ENDOFINPUT
}
```

Colocar o comando na especificação de build na fase de _`post_build`_ levaria a
uma aprovação sendo emitida toda vez, porque de acordo com a documentação, [a
fase de _post-build_ é executada independentemente do sucesso ou falha do
build.][codebuild-transitions] Mais uma emenda se faz necessária. Dessa vez, na
especificação de build:

```yaml
build:
commands:
  - stack build
on-failure: ABORT  # Isso deve ser o suficiente!
```

Uma vez certos de que a role do CodeBuild tem permissão para atualizar o estado
de aprovação de pull requests, abri uma pull request contendo uma mudança
trivial que não quebraria nada e esperei por um build bem sucedido, seguido de
uma aprovação na minha pull request. Os logs do build indicaram que tudo havia
ocorrido como esperado, com uma fase de _post-build_ bem sucedida:

{{< figure
  src="/media/aws-codecommit-dotfiles-4.webp"
  link="/media/aws-codecommit-dotfiles-4.webp"
  alt="Logs mostrando um build bem sucedido e o comando de approval."
>}}

E de fato apareceu uma aprovação na minha pull request, só não encaixada na
regra como era de se esperar:

{{< figure
  src="/media/aws-codecommit-dotfiles-5.webp"
  link="/media/aws-codecommit-dotfiles-5.webp"
  alt="Aprovação do CodeBuild em uma pull request."
>}}

_Por quê?_ Porque o usuário que concedeu a aprovação não estava na pool de
identidades AWS definida no template da regra. Descobri isso ao obter a lista
de aprovações via CLI da AWS:

```bash
$ aws codecommit get-pull-request-approval-states \
    --pull-request-id 3 --revision-id the-revision-found-on-codebuild

{
    "approvals": [
        {
            "userArn": "arn:aws:sts::...:assumed-role/CodeBuildDotfilesRole/...",
            "approvalState": "APPROVE"
        }
    ]
}
```

O state do Terraform mostrava que os membros da pool de identidades do template
eram identificados via _`arn:aws:iam:...`_ e portanto usavam um prefixo IAM em
vez de um STS. Atualizei a declaração do template e pensei que talvez isso
consertaria tudo automaticamente:

```terraform
ApprovalPoolMembers = [
  "${replace(replace(aws_iam_role.codebuild.arn, "role", "assumed-role"), "iam", "sts")}/*"
]
```

Ficu bem feio, mas deve funcionar. _Só que isso não atualizou a regra de
aprovação!_ Acontece que o template da regra é avaliado apenas quando a pull
request é criada e nunca mais. Então criei uma nova pull request e esperei por
outro build para descobrir que o experimento foi um sucesso:

{{< figure
  src="/media/aws-codecommit-dotfiles-6.webp"
  link="/media/aws-codecommit-dotfiles-7.webp"
  alt="Aprovação do CodeBuild em uma pull request."
>}}

E agora? Foi nesse momento, com apenas um item restante na nossa checklist, que
decidi desistir de vez.

[update-approval-state]: https://docs.aws.amazon.com/codecommit/latest/APIReference/API_UpdatePullRequestApprovalState.html
[codebuild-transitions]: https://docs.aws.amazon.com/codebuild/latest/userguide/view-build-details.html#view-build-details-phases

## Por que não recomendo esses serviços

A razão pela qual desisti de terminar esse experimento tem menos a ver com as
limitações desses serviços da AWS e mais a ver com o fato de que não sinto uma
pressão para usá-los no mercado atualmente. São ferramentas ainda imaturas, com
funcionalidades limitadas e com idiossincrasias que só podemos chamar de
falhas. Essas palavras podem muito bem descrever algumas ferramentas usadas
diariamente na indústria de TI, mas não vejo por que essas em particular o
deveriam ser.

Às startups, empresas estabelecidas e indivíduos, esses serviços provavelmente
oferecerão menos valor do que encontrarão em outro lugar. Aqui está uma tabela
comparando apenas alguns aspectos das ferramentas da AWS supracitadas com sua
competição para mostrar o porquê:

{{< compare-table >}}
|                                                     | AWS    | GitHub     | GitLab |
|:----------------------------------------------------|:-------|:-----------|:-------|
| Local único para todos seus grupos e repositórios   | x      | o          | o      |
| CLI dedicado para operações de Git diárias          | x      | o          | o      |
| Habilidade de usar runners próprios nos builds      | x      | o          | o      |
| CI e CD são definidos no mesmo formato e lugar      | x      | o          | o      |
| Gerencia permissões dos runners automaticamente     | x      | o          | o      |
| Pode-se configurar builds de CI/CD com puro Git     | x      | o          | o      |
| Builds de CI falhos proibem que PRs sejam mergeadas | DIY    | 3 clicks   | o      |
| Reporta o status do build para a página da PR       | DIY    | o          | o      |
| Builds de CI podem ser usadas para fazer auto-merge | DIY    | o          | o      |
{{< /compare-table >}}

Acredite, _não estou querendo insultar a AWS._ Há oportunidade para acomodar
muitos fluxos de trabalho elaborados, complicados e únicos, especialmente se
você já usa a AWS para a infraestrutura que suporta suas aplicações --- você
não estaria usando esses serviços se todos os seus workloads estivessem em
outro lugar ---, mas eu simplesmente não consigo superar o quanto de
configuração é necessária apenas para disparar um build ao abrir uma pull
request.

Você não precisa usar todas as ofertas da AWS juntas: você pode hospedar seu
repositório no GitHub ou GitLab enquanto usa o CodeBuild para seus builds de
CI, ou até mesmo usar outros serviços não cobertos aqui, como o _CodeDeploy._
Na verdade, minha crítica aqui é principalmente direcionada ao CodeCommit,
CodeBuild e CodePipeline.

## Palavras finais

Eu levei 2 semanas para terminar de escrever esse artigo. Não é porque mexer
com a AWS ou Terraform é difícil, eu só fiquei ocupado e toda vez que eu
lembrava que teria que voltar a escrever boilerplate, eu ia adiando. Espero que
o que escrevi aqui tenha sido útil ou divertido para você. Em algum momento
futuro pretendo experimentar o _CodeDeploy_ e talvez escreva sobre ele também.

E se você é um dos engenheiros da AWS que trabalhou nessas ferramentas, por
favor não leve minhas críticas para o lado pessoal. Tenho certeza de que vocês
se orgulham do que construíram, e devem! Leve minhas palavras como as de um
cliente que gostaria de ver algumas funcionalidades a mais. Não sei por que
você estaria lendo meu blog, mas se estiver, vocês têm vagas abertas?
Brincadeira. A não ser que...
