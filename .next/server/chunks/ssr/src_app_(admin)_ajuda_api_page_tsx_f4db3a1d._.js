module.exports=[85164,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(5151),e=a.i(33441),f=a.i(54074),g=a.i(43108),h=a.i(60246),i=a.i(83497),j=a.i(41675),k=a.i(91119),l=a.i(75083),m=a.i(99570),n=a.i(86304);function o(){let[a,o]=(0,c.useState)(null),p=(a,b)=>{navigator.clipboard.writeText(a),o(b),setTimeout(()=>o(null),2e3)},q={equipments:[{method:"GET",path:"/api/equipments",description:"Lista todos os equipamentos disponíveis",authRequired:!0,requestExample:[{language:"javascript",code:`fetch('/api/equipments', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log(data))`},{language:"python",code:`import requests

response = requests.get(
    'https://seu-dominio.com/api/equipments',
    headers={'Content-Type': 'application/json'}
)
data = response.json()`}],responseExample:`{
  "equipments": [
    {
      "id": "clx123...",
      "name": "Escavadeira Hidr\xe1ulica",
      "category": "Constru\xe7\xe3o",
      "pricePerDay": 350.00,
      "quantity": 5,
      "available": 3,
      "status": "AVAILABLE",
      "logo": ["https://..."],
      "description": "..."
    }
  ]
}`},{method:"GET",path:"/api/equipments/[id]",description:"Retorna detalhes de um equipamento específico",authRequired:!0,requestExample:[{language:"javascript",code:`fetch('/api/equipments/clx123...', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log(data))`}],responseExample:`{
  "id": "clx123...",
  "name": "Escavadeira Hidr\xe1ulica",
  "category": "Constru\xe7\xe3o",
  "pricePerDay": 350.00,
  "quantity": 5,
  "available": 3,
  "status": "AVAILABLE",
  "logo": ["https://..."],
  "description": "...",
  "createdAt": "2024-01-15T10:00:00Z"
}`},{method:"POST",path:"/api/equipments",description:"Cria um novo equipamento",authRequired:!0,roles:["ADMIN","MANAGER"],requestExample:[{language:"javascript",code:`fetch('/api/equipments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    name: "Betoneira 400L",
    category: "Constru\xe7\xe3o",
    pricePerDay: 80.00,
    quantity: 10,
    description: "Betoneira profissional",
    logo: []
  })
})
  .then(res => res.json())
  .then(data => console.log(data))`}],responseExample:`{
  "id": "clx456...",
  "name": "Betoneira 400L",
  "category": "Constru\xe7\xe3o",
  "pricePerDay": 80.00,
  "quantity": 10,
  "status": "AVAILABLE",
  "createdAt": "2024-01-15T10:00:00Z"
}`}],customers:[{method:"GET",path:"/api/customers",description:"Lista todos os clientes",authRequired:!0,requestExample:[{language:"javascript",code:`fetch('/api/customers', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log(data))`}],responseExample:`{
  "customers": [
    {
      "id": "clx789...",
      "name": "Jo\xe3o Silva",
      "email": "joao@empresa.com",
      "phone": "(11) 98765-4321",
      "cpf": "123.456.789-00",
      "address": "Rua A, 123",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}`},{method:"POST",path:"/api/customers",description:"Cadastra um novo cliente",authRequired:!0,requestExample:[{language:"javascript",code:`fetch('/api/customers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    name: "Maria Santos",
    email: "maria@empresa.com",
    phone: "(11) 91234-5678",
    cpf: "987.654.321-00",
    address: "Av. B, 456"
  })
})
  .then(res => res.json())
  .then(data => console.log(data))`}],responseExample:`{
  "id": "clx999...",
  "name": "Maria Santos",
  "email": "maria@empresa.com",
  "phone": "(11) 91234-5678",
  "cpf": "987.654.321-00",
  "createdAt": "2024-01-15T10:00:00Z"
}`}],bookings:[{method:"GET",path:"/api/bookings",description:"Lista todas as reservas",authRequired:!0,requestExample:[{language:"javascript",code:`fetch('/api/bookings', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log(data))`}],responseExample:`{
  "bookings": [
    {
      "id": "clx111...",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05",
      "totalPrice": 1400.00,
      "status": "CONFIRMED",
      "customer": {
        "name": "Jo\xe3o Silva",
        "email": "joao@empresa.com"
      },
      "equipment": {
        "name": "Escavadeira Hidr\xe1ulica",
        "pricePerDay": 350.00
      }
    }
  ]
}`},{method:"POST",path:"/api/bookings",description:"Cria uma nova reserva",authRequired:!0,requestExample:[{language:"javascript",code:`fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    customerId: "clx789...",
    equipmentId: "clx123...",
    startDate: "2024-02-10",
    endDate: "2024-02-15",
    quantity: 1
  })
})
  .then(res => res.json())
  .then(data => console.log(data))`}],responseExample:`{
  "id": "clx222...",
  "startDate": "2024-02-10",
  "endDate": "2024-02-15",
  "totalPrice": 1750.00,
  "status": "PENDING",
  "createdAt": "2024-01-15T10:00:00Z"
}`}],users:[{method:"GET",path:"/api/users",description:"Lista todos os usuários do sistema",authRequired:!0,roles:["ADMIN","SUPER_ADMIN"],requestExample:[{language:"javascript",code:`fetch('/api/users', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log(data))`}],responseExample:`{
  "users": [
    {
      "id": "clx333...",
      "name": "Admin User",
      "email": "admin@empresa.com",
      "role": "ADMIN",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}`}]};return(0,b.jsxs)("div",{className:"p-8 max-w-6xl mx-auto space-y-8",children:[(0,b.jsxs)("div",{className:"text-center space-y-4",children:[(0,b.jsx)("div",{className:"flex justify-center",children:(0,b.jsx)(f.Code,{className:"h-12 w-12 text-primary"})}),(0,b.jsx)("h1",{className:"text-4xl font-bold font-headline tracking-wide",children:"Documentação da API"}),(0,b.jsx)("p",{className:"text-muted-foreground text-lg",children:"Integre seu sistema com nossa API RESTful"})]}),(0,b.jsxs)(k.Card,{children:[(0,b.jsxs)(k.CardHeader,{children:[(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)(g.Lock,{className:"h-5 w-5"}),(0,b.jsx)(k.CardTitle,{className:"font-headline tracking-wide",children:"Autenticação"})]}),(0,b.jsx)(k.CardDescription,{children:"Como autenticar suas requisições"})]}),(0,b.jsxs)(k.CardContent,{className:"space-y-4",children:[(0,b.jsx)("p",{className:"text-sm text-muted-foreground",children:"A API utiliza autenticação baseada em sessão. Você deve estar logado no sistema para fazer requisições. As requisições devem incluir cookies de sessão."}),(0,b.jsx)("div",{className:"bg-muted p-4 rounded-lg",children:(0,b.jsx)("p",{className:"text-sm font-mono",children:"credentials: 'include' // JavaScript Fetch"})}),(0,b.jsxs)("div",{className:"flex items-start gap-2 p-4 bg-primary/10 dark:bg-primary/20 rounded-lg",children:[(0,b.jsx)(g.Lock,{className:"h-5 w-5 text-primary mt-0.5"}),(0,b.jsxs)("div",{className:"text-sm",children:[(0,b.jsx)("p",{className:"font-medium text-foreground",children:"Importante"}),(0,b.jsx)("p",{className:"text-muted-foreground",children:"Todas as requisições devem ser feitas de domínios autorizados. Requisições de origens não autorizadas serão bloqueadas por CORS."})]})]})]})]}),(0,b.jsxs)(k.Card,{children:[(0,b.jsxs)(k.CardHeader,{children:[(0,b.jsx)(k.CardTitle,{className:"font-headline tracking-wide",children:"Endpoints Disponíveis"}),(0,b.jsx)(k.CardDescription,{children:"Explore os endpoints organizados por recurso"})]}),(0,b.jsx)(k.CardContent,{children:(0,b.jsxs)(l.Tabs,{defaultValue:"equipments",className:"space-y-6",children:[(0,b.jsxs)(l.TabsList,{className:"grid w-full grid-cols-4",children:[(0,b.jsxs)(l.TabsTrigger,{value:"equipments",children:[(0,b.jsx)(i.Package,{className:"h-4 w-4 mr-2"}),"Equipamentos"]}),(0,b.jsxs)(l.TabsTrigger,{value:"customers",children:[(0,b.jsx)(h.Users,{className:"h-4 w-4 mr-2"}),"Clientes"]}),(0,b.jsxs)(l.TabsTrigger,{value:"bookings",children:[(0,b.jsx)(j.Calendar,{className:"h-4 w-4 mr-2"}),"Reservas"]}),(0,b.jsxs)(l.TabsTrigger,{value:"users",children:[(0,b.jsx)(h.Users,{className:"h-4 w-4 mr-2"}),"Usuários"]})]}),Object.entries(q).map(([c,f])=>(0,b.jsx)(l.TabsContent,{value:c,className:"space-y-6",children:f.map((c,f)=>(0,b.jsxs)("div",{className:"border rounded-lg p-6 space-y-4",children:[(0,b.jsxs)("div",{className:"flex items-start justify-between",children:[(0,b.jsxs)("div",{className:"space-y-2",children:[(0,b.jsxs)("div",{className:"flex items-center gap-3",children:[(0,b.jsx)(n.Badge,{variant:"GET"===c.method||"POST"===c.method?"default":"destructive",className:"GET"===c.method?"bg-green-600":"POST"===c.method?"bg-primary":"",children:c.method}),(0,b.jsx)("code",{className:"text-sm font-mono bg-muted px-2 py-1 rounded",children:c.path})]}),(0,b.jsx)("p",{className:"text-sm text-muted-foreground",children:c.description}),c.roles&&(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)(g.Lock,{className:"h-3 w-3 text-orange-600"}),(0,b.jsxs)("span",{className:"text-xs text-orange-600",children:["Requer papel: ",c.roles.join(", ")]})]})]}),c.authRequired&&(0,b.jsx)(g.Lock,{className:"h-4 w-4 text-muted-foreground"})]}),c.requestExample&&(0,b.jsxs)("div",{className:"space-y-2",children:[(0,b.jsx)("h4",{className:"text-sm font-medium",children:"Exemplo de Requisição:"}),(0,b.jsxs)(l.Tabs,{defaultValue:c.requestExample[0].language,children:[(0,b.jsx)(l.TabsList,{children:c.requestExample.map(a=>(0,b.jsx)(l.TabsTrigger,{value:a.language,children:"javascript"===a.language?"JavaScript":"Python"},a.language))}),c.requestExample.map(f=>(0,b.jsx)(l.TabsContent,{value:f.language,children:(0,b.jsxs)("div",{className:"relative",children:[(0,b.jsx)("pre",{className:"bg-muted p-4 rounded-lg overflow-x-auto text-sm",children:(0,b.jsx)("code",{children:f.code})}),(0,b.jsx)(m.Button,{size:"sm",variant:"ghost",className:"absolute top-2 right-2",onClick:()=>p(f.code,`${c.path}-${f.language}`),children:a===`${c.path}-${f.language}`?(0,b.jsx)(e.Check,{className:"h-4 w-4"}):(0,b.jsx)(d.Copy,{className:"h-4 w-4"})})]})},f.language))]})]}),c.responseExample&&(0,b.jsxs)("div",{className:"space-y-2",children:[(0,b.jsx)("h4",{className:"text-sm font-medium",children:"Exemplo de Resposta:"}),(0,b.jsxs)("div",{className:"relative",children:[(0,b.jsx)("pre",{className:"bg-muted p-4 rounded-lg overflow-x-auto text-sm",children:(0,b.jsx)("code",{children:c.responseExample})}),(0,b.jsx)(m.Button,{size:"sm",variant:"ghost",className:"absolute top-2 right-2",onClick:()=>p(c.responseExample,`${c.path}-response`),children:a===`${c.path}-response`?(0,b.jsx)(e.Check,{className:"h-4 w-4"}):(0,b.jsx)(d.Copy,{className:"h-4 w-4"})})]})]})]},f))},c))]})})]}),(0,b.jsxs)(k.Card,{children:[(0,b.jsxs)(k.CardHeader,{children:[(0,b.jsx)(k.CardTitle,{className:"font-headline tracking-wide",children:"Códigos de Status HTTP"}),(0,b.jsx)(k.CardDescription,{children:"Códigos de resposta que a API pode retornar"})]}),(0,b.jsx)(k.CardContent,{children:(0,b.jsx)("div",{className:"space-y-3",children:[{code:200,description:"Requisição bem-sucedida"},{code:201,description:"Recurso criado com sucesso"},{code:400,description:"Dados inválidos ou requisição mal formatada"},{code:401,description:"Não autenticado - faça login primeiro"},{code:403,description:"Sem permissão para acessar este recurso"},{code:404,description:"Recurso não encontrado"},{code:500,description:"Erro interno do servidor"}].map(a=>(0,b.jsx)("div",{className:"flex items-center justify-between p-3 border rounded-lg",children:(0,b.jsxs)("div",{className:"flex items-center gap-3",children:[(0,b.jsx)(n.Badge,{variant:a.code>=200&&a.code<300?"default":a.code>=400&&a.code<500?"secondary":"destructive",className:a.code>=200&&a.code<300?"bg-green-600":a.code>=400&&a.code<500?"bg-accent":"",children:a.code}),(0,b.jsx)("span",{className:"text-sm",children:a.description})]})},a.code))})})]}),(0,b.jsxs)(k.Card,{children:[(0,b.jsxs)(k.CardHeader,{children:[(0,b.jsx)(k.CardTitle,{className:"font-headline tracking-wide",children:"Boas Práticas"}),(0,b.jsx)(k.CardDescription,{children:"Recomendações para usar a API de forma eficiente"})]}),(0,b.jsx)(k.CardContent,{children:(0,b.jsxs)("ul",{className:"space-y-3 text-sm",children:[(0,b.jsxs)("li",{className:"flex items-start gap-2",children:[(0,b.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,b.jsxs)("div",{children:[(0,b.jsx)("strong",{children:"Sempre verifique o status HTTP"})," antes de processar a resposta"]})]}),(0,b.jsxs)("li",{className:"flex items-start gap-2",children:[(0,b.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,b.jsxs)("div",{children:[(0,b.jsx)("strong",{children:"Implemente retry logic"})," para requisições que falharem por erro temporário"]})]}),(0,b.jsxs)("li",{className:"flex items-start gap-2",children:[(0,b.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,b.jsxs)("div",{children:[(0,b.jsx)("strong",{children:"Use cache"})," para dados que não mudam frequentemente"]})]}),(0,b.jsxs)("li",{className:"flex items-start gap-2",children:[(0,b.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,b.jsxs)("div",{children:[(0,b.jsx)("strong",{children:"Valide os dados"})," no cliente antes de enviar para a API"]})]}),(0,b.jsxs)("li",{className:"flex items-start gap-2",children:[(0,b.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,b.jsxs)("div",{children:[(0,b.jsx)("strong",{children:"Trate erros adequadamente"})," e forneça feedback claro ao usuário"]})]}),(0,b.jsxs)("li",{className:"flex items-start gap-2",children:[(0,b.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,b.jsxs)("div",{children:[(0,b.jsx)("strong",{children:"Não exponha credenciais"})," no código do cliente"]})]})]})})]}),(0,b.jsxs)(k.Card,{className:"bg-card border-border",children:[(0,b.jsxs)(k.CardHeader,{children:[(0,b.jsx)(k.CardTitle,{className:"font-headline tracking-wide",children:"Limites de Taxa"}),(0,b.jsx)(k.CardDescription,{children:"Informações sobre limites de requisições"})]}),(0,b.jsx)(k.CardContent,{children:(0,b.jsx)("p",{className:"text-sm text-muted-foreground",children:"Atualmente não há limites de taxa implementados, mas recomendamos fazer no máximo 100 requisições por minuto para garantir a estabilidade do sistema. Limites mais rigorosos podem ser implementados no futuro."})})]})]})}a.s(["default",()=>o])}];

//# sourceMappingURL=src_app_%28admin%29_ajuda_api_page_tsx_f4db3a1d._.js.map