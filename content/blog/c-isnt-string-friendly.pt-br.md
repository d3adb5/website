---
draft: false
date: 2023-06-08

title: Programas escritos em C podem ser mais lentos
subtitle: Melhor dizendo, pode ser que as escolha te faça fazê-los mais lentos!

tags: [ Programação, Tecnologia, Opiniões, Desabafos ]

toc: false
---

Há uma década, se vocẽ me pedisse para falar sobre programação, eu, _jovem e
inexperiente,_ provavelmente diria que todo mundo deveria programar em C, para
que todos os programas pudessem ter alta performance e que programadores que
reclamavam da linguagem eram preguiçosos demais para lidar com alocação de
memória e ponteiros. **Que vergonha!**

Tenho certeza que eu atribuía qualquer lentidão ou delay a _desenvolvedores
Java preguiçosos:_

> Vou apertar o botão direito do controle e vamos esperar a animação terminar.
> Viu só quanto tempo demorou? Isso tudo é culpa do Java e de programadores
> preguiçosos. Se tivesse sido escrito em C...
>
> --- Eu, apontando para uma smart TV

Minha visão de mundo naturalmente mudou desde então. A tolice da juventude não
pode durar muito, afinal: cometer enganos e encontrar caminhos alternativos te
ensina mais rápido do que qualquer outro método. Haskell me ensinou como uma
linguagem elegante e sucinta ainda pode ser [compilada e dar origem a programas
otimizados,][haskell-profiling] e com o tempo aprendi que otimização ao nível
arquitetural ou algorítmico tem um impacto muito maior em performance na
maioria dos casos.

O que eu quero dizer com este artigo, no entanto, **não tem nada a ver com
otimizações de compilador,** e apenas um pouco a ver com complexidade de
algoritmos. Muito se fala sobre como C continua sendo a linguagem de escolha
quando performance importa, mas sinto que não se fala o suficiente sobre a
preguiça inerente de programadores que fazem da linguagem, às vezes, uma
escolha ruim.

[haskell-profiling]: https://book.realworldhaskell.org/read/profiling-and-optimization.html

## Um exemplo concreto do que quero dizer

O exemplo que me levou a tal conclusão é um caso específico, mas pessoalmente
frustrante, já que acabei de submeter uma pull request mudando mais de 900
linhas nesse projeto: [stalonetray,][stalonetray] uma "bandeja" de sistema para
o X11. Especificamente, como ele traduz valores de parâmetros para valores
enumerados. Isso provavelmente já diz o suficiente para programadores C lendo
este artigo.

O seguinte trecho foi tirado de [`src/settings.c`][snippet]:

{{< highlight c "linenos=inline,linenostart=147" >}}
if (!strcmp(str, "none"))
    **tgt = DOCKAPP_NONE;
else if (!strcmp(str, "simple"))
    **tgt = DOCKAPP_SIMPLE;
else if (!strcmp(str, "wmaker"))
    **tgt = DOCKAPP_WMAKER;
else {
    PARSING_ERROR("none, simple, or wmaker expected", str);
    return FAILURE;
}
{{< /highlight >}}

Para os que por qualquer motivo não podem facilmente ler C, o trecho acima
segue o seguinte fluxo:

1. Se a string `str` for igual a `"none"`, atribua o valor de `DOCKAPP_NONE` a
   `**tgt`.
2. Caso contrário, se a string `str` for igual a `"simple"`, atribua o valor de
   `DOCKAPP_SIMPLE` a `**tgt`.
3. Caso contrário, se a string `str` for igual a `"wmaker"`, atribua o valor de
   `DOCKAPP_WMAKER` a `**tgt`.
4. Caso contrário, imprima uma mensagem de erro e retorne `FAILURE`.

É importante explicar que apesar da presença de literais de string, _strings
não são membros de primeira classe em C._ Elas são ponteiros para o primeiro
caractere (`char`) da string, e a convenção diz que a string termina quando um
caractere com valor `0` (também representado por `'\0'`) é encontrado. Não há
forma mais simples de implementar strings em uma linguagem de programação.

Por conta disso, _comparação de strings é na verdade subtração de caracteres:_
uma definição base para a função _`strcmp`_ da biblioteca padrão de C --- a
função que "cmp"ara "str"ings --- pode ser:

```c
int strcmp(const char *a, const char *b)
{
    for(; *a && *b && *a == *b; a++, b++);
    return *a - *b;
}
```

Um pouco chato de decifrar? É, o loop _`for`_ vazio não ajuda muito, e estamos
usando aritmética de ponteiros, também. Aqui está uma implementação
equivalente, mas com comentários explicando cada passo do algoritmo:

```c
int strcmp(const char *left, const char *right)
{
    // Enquanto as strings 'left' e 'right' não tenham terminado, e seu
    // primeiro caractere for o mesmo...
    while ( *left != '\0' && *right != '\0' && *left == *right ) {
        // Descartamos o primeiro caractere delas (dentro dessa função)
        left  = left  + 1; // left + 1 points to the next char in the string.
        right = right + 1; // right + 1 points to the next char in the string.
    }

    // Caracteres em C são só bytes, então podemos subtrair seus valores
    // numéricos e o fazer cast implícito do resultado para int. Retornamos tal
    // diferença e pronto.
    return *left - *right;
}
```

Este é um algorítimo linear, com complexidade _O(n)._ Uma comparação entre
strings iguais é o pior cenário possível, já que a função precisará iterar as
duas strings até achar dois caracteres diferentes ou o fim de uma delas.

Sendo assim, aquela cadeia de _`if`_ que mostrei no começo do artigo é não só
ruim de ler, mas também não é a forma mais eficiente de fazer o que o código se
propõe a fazer. _Pode muito bem ser que performance não interesse muito nesse
caso em particular,_ mas isso é irrelevante para o meu argumento. Se assumimos
uma situação em que o número de valores na enumeração possa crescer --- e
consequentemente a cadeia de condicionais ---, o uso desse estilo de código vai
nos levar a desperdiçar ciclos de CPU. Uma tabela hash seria muito mais
eficiente, **mas será que ainda seria legível?**

[stalonetray]: https://github.com/kolbusa/stalonetray
[snippet]: https://github.com/kolbusa/stalonetray/blob/4e92d630c8fe701d55e0f4493d989310adea3663/src/settings.c#L147-L156

## O preguiçoso programador

_Programadores procuram ser preguiçosos._ Programação é uma forma de
automatizar tarefas tediosas: deixar a máquina fazer o trabalho que não
queremos fazer nós mesmos, já que ela é capaz de processar números muito mais
rápido do que nós podemos. É natural que queiramos esquecer como a máquina
funciona por baixo, e focar em declarar o que queremos fazer **da forma mais
concisa possível.**

Esta última colocação, combinada com o que foi dito ao final da seção anterior,
é o cerne do meu argumento: buscamos eficiência em nosso código, mas _mais do
que isso, buscamos eficiência no uso do nosso tempo e energia._ Se podemos
fazer o que queremos usando menos palavras, dificilmente pensaremos duas vezes.
No caso particular do trecho de código usado de exemplo, o programador
provavelmente pensou uma ou mais das seguintes coisas:

- Otimização prematura é a raiz de todo o mal.
- Não há necessidade de performance aqui, esse parser roda apenas uma vez.
- O tradeoff entre performance e legibilidade não vale a pena.
- Isso é mais fácil de manter do que escrever uma tabela hash.
- Vamos evitar reinventar a roda ou adicionar outra dependência.

E assim nasceu aquela cadeia de condicionais! **Não dá para culpar ninguém.**

### Mas seria mesmo tão difícil de manter?

[Aqui][uthash] temos uma implementação simples de tabela hash genérica chamada
_uthash,_ que poderia ter sido adicionada como dependência para tornar o código
mais legível. Dê uma olhada nos arquivos do projeto. Uma implementação
especializada para `const char * -> int` não seria muito diferente do que você
vê ali, exceto talvez pela presença de menos macros do pré-processador.

Em resumo, escrever isso do zero não seria uma experiência suave para o
programador, tanto na primeira escrita quanto na hora de manter o código no
futuro.

[uthash]: https://github.com/troydhanson/uthash/blob/master/src/uthash.h

### O que deveríamos fazer, então?

Sinto ter que dizer isso, mas _use uma linguagem moderna se você puder._ C está
aqui para ficar, e provavelmente vai continuar sendo bastante usada mesmo
depois que Rust e Go se tornem mais populares. É uma ótima linguagem para
programação de sistemas, mas se você vai usá-la, já sabe quais são as
desvantagens que vai enfrentar. Compare o trecho de código do stalonetray com
esses trechos escritos descuidadamente em outras linguagens.

#### Python

Tabelas hash existem no formato de dicionários, uma estrutura de dados já
presente na biblioteca padrão, com uma representação literal fácil de ler que
lembra JSON.

```python
from enum import Enum

class DockAppMode(Enum):
  # ...

dockapp_mode_dict = {
  "none": DOCKAPP_NONE,
  "simple": DOCKAPP_SIMPLE,
  "wmaker": DOCKAPP_WMAKER
}

def parse_dockapp_mode(s):
  return dockapp_mode_dict[s]
```

#### Haskell

Tabelas hash existem na forma do tipo `Map`, de `Data.Map`, mas temos
ferramentas mais modernas para fazer o que queremos. Aqui estão algumas
possibilidade, começando com uma _instância derivada da classe `Read`:_

```haskell
-- Com isso, você pode só usar 'None', 'Simple', ou 'WMaker' nas strings!
data DockAppMode = None | Simple | WMaker deriving (Show, Read)
```

Também dá para usar pattern matching e deixar que o compilador otimize o que
queremos. Assim não precisamos fazer a comparação de strings nós mesmos com
outra função, ou com cadeias de condicionais:

```haskell
parseDockAppMode :: String -> Maybe DockAppMode
parseDockAppMode "none"   = Just None
parseDockAppMode "simple" = Just Simple
parseDockAppMode "wmaker" = Just WMaker
parseDockAppMode _        = Nothing
```

E finalmente, usando um mapa:

```haskell
import Data.Map

_dockAppModeMap :: Map String DockAppMode
_dockAppModeMap = fromList [("none", None), ("simple", Simple), ("wmaker", WMaker)]

parseDockAppMode' :: String -> DockAppMode
parseDockAppMode' = (_dockAppModeMap !)
```

#### Java

Tabelas hash existem na forma da classe `HashMap`, e strings são tipos de
primeira classe:

```java
import java.util.HashMap;

class Example {
    enum DockAppMode {
        NONE, SIMPLE, WMAKER
    }

    private static final HashMap<String, DockAppMode> dockAppModeMap = new HashMap<String, DockAppMode>() {{
        put("none", DockAppMode.NONE);
        put("simple", DockAppMode.SIMPLE);
        put("wmaker", DockAppMode.WMAKER);
    }};

    public DockAppMode parseDockAppMode(String s) {
        return dockAppModeMap.get(s);
    }
}
```

Não vou escrever mais do que isso aí.

#### Rust

A linguagem que muitos dizem ser a sucessora do C. Não parece existir açúcar
sintático para tabelas hash, mas a biblioteca padrão tem [uma coleção `HashMap`
que podemos usar][rust-hashmap], e assim como Haskell, Rust também oferece
[pattern matching.][rust-patterns] Não posso nem fingir que sei escrever código
em Rust, e minhas tentativas de compilar alguma coisa decente foram rejeitadas
pelo compilador.

[rust-hashmap]: https://doc.rust-lang.org/book/ch08-03-hash-maps.html
[rust-patterns]: https://doc.rust-lang.org/book/ch18-03-pattern-syntax.html
