# arqgen-layouts

Repositório contendo o micro front-end do produto Viabiliza Layouts.

Aqui estarão centralizados os módulos que estarão disponíveis nesse produto.

Esse projeto faz parte da plataforma de micro front-ends e se integra ao repositório https://github.com/arqgen/saas.

O principal objetivo desse projeto é permitir a definição e configuração de um ambiente a partir de um arquivo DWG, possibilitando a geração de soluções de posicionamento para os diferentes espaços dentro desse ambiente.

Importante frisar que esse repositório contém apenas o front-end, com o back-end correspondente estando isolado em um projeto dedicado a cada cliente. O caso do repositório https://github.com/arqgen/einstein é um exemplo.

## Tecnologias Utilizadas

-   **React**
-   **TypeScript**: Suporte a tipagem estática, melhorando a segurança e legibilidade do código.
-   **AWS (CloudFront, S3)**
-   **Serverless Stack (SST)**
-   **Chakra UI**: Framework de UI para React, usado para a criação de interfaces acessíveis e responsivas.
-   **Styled Components**: Biblioteca para estilização de componentes React com CSS-in-JS.

## Como usar

1. Clone o repositório:

    ```bash
    git clone git@github.com:arqgen/arqgen-layouts.git
    ```

2. Instale as dependências - (instalará dependências de raiz e packages/web):

    ```bash
    npm install
    ```

3. Vá pra o diretório packages/ts/web
    ```bash
    cd packages/ts/web
    ```

4. Inicie a aplicação localmente, vá pra packages/web
    ```bash
    npm run dev
    ```

### Configuração desse micro front-end em um tenant:

É necessário adicionar o objeto referente a esse produto no parâmetro `mfe` do tenant no banco de dados:

Exemplo:
```
{
        "name": "saas_arqgen_layouts",
        "version": 1,
        "module": [
            "Triggers",
            "Factory",
            "LayoutSolutions"
        ],
        "url": "<URL>/saas_arqgen_layouts.js",
        "features": {
            "uploadFile": {
                "LAYOUT": {
                    "conversion": "DWG_TO_AQG_GEOJSON"
                }
            }
        },
        "apiUrls": {
            "thumbnail": <API de thumbnail desse cliente>
        }
},
```

Esse objeto pode sofrer alterações. Se for o caso, atualize essa documentação.


## Funcionalidades
 
- **Definição e ajuste de layout**: Com base no arquivo DWG, o usuário pode configurar a disposição dos ambientes dentro de cada setor, interagindo com a thumbnail.  
- **Atribuição de valores de projeto arquitetônico**: Possibilidade de definir parâmetros arquitetônicos.  
- **Geração de layouts de soluções**: A partir do projeto arquitetônico, o sistema pode gerar diferentes soluções de distribuição e organização dos ambientes.  
- **Fluxo baseado em steps**: O processo foi estruturado em etapas (steps), permitindo que o fluxo seja ajustado conforme a necessidade do cliente, com a possibilidade de adicionar, remover ou modificar steps de acordo com requisitos específicos.  

