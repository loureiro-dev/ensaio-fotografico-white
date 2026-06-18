# Guia de Edição: Landing Page Ensaio.AI

Este guia foi criado para que você consiga fazer alterações rápidas e autônomas no arquivo `index.html` da sua Landing Page, sem medo de quebrar o código.

---

## 🖼️ Como Alterar Imagens (Logo, Banners, Favicon)

Sempre que precisar alterar uma imagem, você deve hospedar a imagem em um site como o [ImgBB](https://pt.imgbb.com/) e pegar o "Link Direto" (que termina em `.png` ou `.jpg`).

**Exemplo: Alterar a Logo do topo**
Abra o `index.html` e procure (Ctrl+F) por `alt="Ensaio.AI Logo"`. Você verá um código assim:
```html
<img src="https://i.ibb.co/jZ54BcDB/logo-antiga.png" alt="Ensaio.AI Logo">
```
Basta trocar o link que está dentro das aspas do `src="..."` pelo seu novo link.

**Exemplo: Alterar o Favicon (ícone da aba do navegador)**
Procure por `rel="icon"` no início do arquivo (dentro da tag `<head>`).
```html
<link rel="icon" type="image/png" href="SEU_NOVO_LINK_AQUI.png">
```

---

## 🔘 Como Editar os Botões Principais

A maioria dos botões da página que não são do Popup (ex: o botão do cabeçalho ou o botão flutuante no final) seguem esta estrutura:
```html
<a href="#" onclick="openTypebot(event)" class="btn btn-primary">
  Começar Agora
</a>
```
- **Texto do botão:** Mude o texto "Começar Agora" para o que preferir.
- **Cor:** A classe `btn-primary` puxa o verde neon principal. Se você mudar para `btn-white`, ele ficará branco.
- **Ícones dentro do botão:** Para trocar o ícone, olhe para as tags `<i>`. Ex: `<i class="ph-bold ph-arrow-right"></i>`. Você pode escolher qualquer ícone no site do [Phosphor Icons](https://phosphoricons.com/) e substituir a classe `ph-arrow-right` pelo nome do novo ícone.

---

## 📝 Como Alterar os Textos dos Cards (Popup)

Os textos dos cards estão no final do arquivo HTML, dentro da tag `<script>`. Procure (Ctrl+F) por `const cards = [`.

Você verá a lista de cards estruturada assim:
```javascript
{
  icon: '<i class="ph-bold ph-target"></i>',
  title: 'SEU NOVO TÍTULO AQUI',
  body: 'Sua nova descrição aqui.',
  btn: 'Texto do Botão de Avançar →',
  prog: [true, false, false],
  action: 'next'
}
```
Basta alterar o texto **exatamente entre as aspas simples (`' '`)**. Cuidado para não apagar as aspas ou a vírgula no final da linha!

---

## 🎨 Como Alterar as Cores Globais

Se um dia você decidir que a marca não é mais Verde Neon, basta procurar a variável de cor principal no topo do arquivo HTML, dentro da tag `<style>`:

```css
:root {
  --primary: #47E745; /* Mude esse código HEX para a nova cor */
  --primary-dark: #2da12c; /* Uma versão mais escura da mesma cor */
}
```
Lembre-se também de atualizar no painel de Customização do Typebot para que o chat combine com a LP.

---

> [!TIP]
> **Dica de Ouro:** Sempre que for mexer no HTML, faça uma cópia do arquivo `index.html` (ex: `index_bkp.html`) antes de alterar. Se algo der errado, é só restaurar a cópia!
