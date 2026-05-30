# 🚀 Guia de Configuração e Implantação: Painel RP Cyber-Minimalista

Este guia contém as instruções passo a passo para conectar o banco de dados Firebase Realtime Database, configurar as permissões de acesso e segurança por IDs, e implantar o projeto no **Vercel** de forma 100% gratuita.

O projeto utiliza o **design cyber-minimalista roxo neon premium** já configurado nesta pasta, fornecendo sincronização instantânea em tempo real (estilo chat) para toda a sua equipe.

---

## 📂 Arquivos do Seu Projeto
* **`index.html`**: Estrutura do painel com suporte aos scripts do Firebase.
* **`style.css`**: Design premium roxo/violeta neon com painel console e scrollbars customizados.
* **`app.js`**: Mecanismo de lógica, controle de autenticação por IDs autorizados e sincronização em tempo real.
* **`vercel.json`**: Configurações de rotas e segurança do Vercel.

---

## 🛠️ Passo 1: Criar o Projeto no Firebase (Gratuito)
1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e faça login com sua conta do Google.
2. Clique em **Criar um projeto** (ou *Add project*).
3. Insira o nome do seu projeto (ex: `Wolfside RP Dashboard`) e clique em **Continuar**.
4. Desative a opção do Google Analytics (desnecessária para o painel) e clique em **Criar projeto**.
5. Quando a criação for concluída, clique em **Continuar**.

---

## 💾 Passo 2: Ativar o Realtime Database
1. No menu lateral esquerdo do painel do Firebase, clique em **Construir** (ou *Build*) -> **Realtime Database**.
2. Clique no botão azul **Criar banco de dados** (ou *Create database*).
3. Selecione a região recomendada (geralmente `United States` ou `Belgium`) e clique em **Avançar**.
4. Em "Regras de Segurança", escolha **Iniciar no modo de teste** (isso permite a comunicação inicial do painel) e clique em **Ativar**.

---

## 🔒 Passo 3: Configurar as Regras de Permissão (Firebase Rules)
Por padrão, o Firebase bloqueia conexões externas após alguns dias em modo de teste. Para manter o painel sincronizando de forma estável para todos os leitores e gravar dados apenas de líderes autenticados:

1. Na página do seu Realtime Database no Firebase, clique na aba **Regras** (na barra superior).
2. Substitua o código existente por este bloco de regras públicas:
   ```json
   {
     "rules": {
       ".read": "true",
       ".write": "true"
     }
   }
   ```
   *(Nota: A segurança de gravação é filtrada e validada pelo Discord ID diretamente na lógica do painel).*
3. Clique no botão **Publicar** (ou *Publish*).

---

## 🔑 Passo 4: Pré-configurar as Credenciais no Painel (Opcional)
Suas chaves do Firebase já vêm configuradas de fábrica no arquivo `app.js`! Mas se precisar alterá-las no futuro ou usar outro banco:

1. No console do Firebase, clique no ícone de **Engrenagem** (Configurações do Projeto) no topo esquerdo -> **Configurações do projeto**.
2. Na aba **Geral**, role até o final da página e na seção "Meus aplicativos", clique no botão de **Web (`</>`)**.
3. Registre o aplicativo dando um apelido (ex: `Painel Web`) e clique em **Registrar app**.
4. O Firebase exibirá um bloco de código com as credenciais. Cole estes valores no objeto `SYSTEM_CONFIG` no topo do arquivo **[app.js](file:///d:/Nova%20pasta/app.js)**:
   ```javascript
   const SYSTEM_CONFIG = {
       firebase: {
           apiKey: "SUA_API_KEY",
           databaseURL: "SUA_DATABASE_URL",
           projectId: "SEU_PROJECT_ID"
       }
   };
   ```

---

## ⚡ Passo 5: Hospedar e Implantar no Vercel (Gratuito)

### Opção A: Deploy pelo GitHub (Recomendado para atualizações automáticas)
1. Crie um repositório privado ou público no seu [GitHub](https://github.com).
2. Envie todos os arquivos da pasta `d:\Nova pasta` para esse repositório.
3. Acesse o [Vercel](https://vercel.com) e conecte sua conta do GitHub.
4. Clique em **Add New** -> **Project** e selecione o repositório do seu painel.
5. Deixe todas as configurações padrão e clique no botão azul **Deploy**.
6. A Vercel criará o seu link público seguro (ex: `https://seu-painel.vercel.app`) em 15 segundos!

### Opção B: Deploy Manual via Vercel CLI (Sem GitHub)
1. Instale o Node.js no seu computador se ainda não tiver.
2. Abra o terminal na pasta do projeto (`d:\Nova pasta`) e digite:
   ```bash
   npm install -g vercel
   ```
3. Digite `vercel` no terminal para iniciar o deploy.
4. Siga os passos na tela (confirme o login no navegador e responda "Yes" para criar o projeto).
5. Pronto! O terminal gerará o link do seu painel publicado na nuvem.

---

## 👥 Segurança e Autenticação de Administradores
* **Modo Leitura**: Por padrão, qualquer pessoa que abrir o site só poderá visualizar as facções e copiar as coordenadas no jogo (os campos de texto e lixeiras estarão desativados).
* **Autenticação**: Para editar ou apagar facções, o líder clica no cadeado escrito `LEITURA (BLOQUEADO)` no topo esquerdo, digita o seu **ID Discord** ou **ID Cidade** (os IDs padrões pré-autorizados no código são: `1085341634914418708`, `321658631672168455` e `267818860332318720`) e clica em **Autenticar**.
* **Gerenciamento**: Uma vez autenticado, você pode cadastrar novos IDs autorizados a editar digitando o ID deles no campo **"IDS AUTORIZADOS A EDITAR"** no canto inferior direito do painel.
