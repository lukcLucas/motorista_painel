🔐 OPÇÃO 1: Restringir por IP no Nginx (ou Apache)

Essa é a forma mais simples de restringir o acesso se os usuários acessam sempre da empresa (com IP fixo).
✅ Exemplo com Nginx:

server {
    listen 80;
    server_name sua-aplicacao.com;

    location / {
        allow 189.123.45.67;   # IP fixo da empresa
        deny all;

        proxy_pass http://localhost:3000;  # Ou sua porta/backend real
    }
}

📌 Substitua 189.123.45.67 pelo IP da empresa.

    Para descobrir o IP da empresa, acesse https://meuip.com.br a partir da rede da empresa.

🔐 OPÇÃO 2: Proteger com Autenticação HTTP Básica

Se os IPs mudam (ex: usuários acessam de casa), mas você quer algo simples, pode usar um login/senha simples com htpasswd.
🔧 Passos:

    Instale apache2-utils (para gerar senha):

sudo apt install apache2-utils

Crie o arquivo de senha:

htpasswd -c /etc/nginx/.htpasswd usuario

Configure no nginx.conf:

    location / {
        auth_basic "Acesso restrito";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://localhost:3000;
    }

🔐 OPÇÃO 3: Acesso via VPN (mais seguro)

Você pode instalar uma VPN na VPS, como o WireGuard (mais leve que o OpenVPN), e tornar sua aplicação acessível somente via rede interna VPN.
Exemplo com WireGuard:

    Instale o WireGuard com um script (recomendado):

curl -O https://raw.githubusercontent.com/angristan/wireguard-install/master/wireguard-install.sh
chmod +x wireguard-install.sh
./wireguard-install.sh

Siga as instruções e adicione os dispositivos da empresa.

A aplicação ficará acessível apenas por quem estiver conectado à VPN.
