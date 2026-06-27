# Política de Segurança

## Versões suportadas

| Versão | Suportada |
|--------|-----------|
| 1.x    | ✅ Sim     |
| < 1.0  | ❌ Não     |

## Reportando uma vulnerabilidade

**Não abra uma issue pública para vulnerabilidades de segurança.**

Envie um e-mail para **contato@eaiacademy.com** com:

- Descrição da vulnerabilidade e potencial impacto.
- Passos para reproduzir (o mais detalhado possível).
- Versões afetadas.
- Sugestão de correção (opcional).

Você receberá uma resposta em até **72 horas** confirmando o recebimento. Trabalharemos
para corrigir e divulgar a vulnerabilidade de forma responsável (coordinated disclosure).

## Escopo

O eAI Cockpit é uma **ferramenta local** — o servidor roda na sua máquina e não é exposto
à internet por padrão. Mesmo assim, levamos a sério:

- Path traversal / acesso a arquivos fora dos workspaces configurados.
- XSS via conteúdo de arquivo renderizado no frontend.
- Exposição acidental de dados do filesystem.
- Supply chain (dependências maliciosas).

## Aviso legal

O software é fornecido **"AS IS"**, sem garantia de qualquer tipo. Veja o [LICENSE](LICENSE).
