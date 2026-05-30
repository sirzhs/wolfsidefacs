# 🔥 Guia de Configuração: Banco de Dados Firebase Realtime Database (Gratuito)

O seu painel tático agora utiliza o **Firebase Realtime Database (Nuvem Google)** como banco de dados em tempo real!

## ⚡ Benefícios da Migração
1. **Tempo Real Absoluto**: Se um líder alterar uma coordenada ou rádio, a tela de toda a sua equipe é atualizada no mesmo milissegundo, de forma instantânea (sem recarregamentos de 15 segundos).
2. **100% Gratuito**: O plano gratuito do Firebase oferece cotas gigantescas (até 100 conexões ativas ao mesmo tempo e 10 GB de tráfego por mês), ideal para servidores movimentados.
3. **Fácil e Visual**: Todo o processo é feito clicando na tela do Firebase em 1 minuto.

---

## 🛠️ Passo a Passo para Ativar

### Passo 1: Criar o Projeto Gratuito no Firebase
1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e entre com sua conta Google.
2. Clique no botão **Criar um projeto** (ou *Add project*).
3. Dê um nome ao seu projeto (ex: `Painel WolfSide RP`) e clique em **Continuar**.
4. Desative a opção do Google Analytics (não é necessária para o painel) e clique em **Criar projeto**.
5. Quando o projeto estiver pronto, clique em **Continuar**.

---

### Passo 2: Ativar o Banco de Dados Realtime Database
1. No menu lateral esquerdo do console do Firebase, clique em **Construir** (ou *Build*) -> **Realtime Database**.
2. Clique no botão azul **Criar banco de dados** (ou *Create database*).
3. Selecione a região recomendada (ex: `United States` ou `Belgium`) e clique em **Avançar**.
4. Em "Regras de Segurança", selecione **Iniciar no modo de teste** (isso permite que o painel leia/grave os dados de forma simples) e clique em **Ativar**.

---

### Passo 3: Configurar as Regras de Acesso
Para garantir que o painel funcione sem travar, precisamos liberar o acesso de leitura/escrita. 
*(Não se preocupe: a segurança de quem pode editar continua sendo validada pelo Discord ID de forma segura no painel)*.

1. Na tela do Realtime Database, clique na aba **Regras** (no topo).
2. Substitua o código existente por este padrão simples:
   ```json
   {
     "rules": {
       ".read": "true",
       ".write": "true"
     }
   }
   ```
3. Clique em **Publicar** (ou *Publish*).

---

### Passo 4: Obter as Credenciais e Conectar
1. No canto superior esquerdo do console, clique na **Engrenagem** (Configurações do Projeto) -> **Configurações do projeto**.
2. Na aba **Geral**, role até o final da página e, na seção "Meus aplicativos", clique no ícone de **Web (`</>`)** para registrar um aplicativo.
3. Dê um apelido (ex: `WolfSide Web`) e clique em **Registrar app**.
4. O Firebase exibirá um bloco de código contendo o objeto `firebaseConfig`. Copie os seguintes valores dali:
   * **apiKey**: (copie o código da chave)
   * **databaseURL**: (copie o link do banco)
   * **projectId**: (copie o ID do projeto)
5. Abra o seu painel, vá em **CONFIGURAÇÕES** no cabeçalho e cole essas 3 chaves nos respectivos campos.
6. Clique em **Conectar & Sincronizar**.

Pronto! O status mudará para **CONECTADO FIREBASE** e a sincronização instantânea em tempo real estará funcionando de graça e para sempre!
