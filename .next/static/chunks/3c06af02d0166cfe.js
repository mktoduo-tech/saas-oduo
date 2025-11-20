(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,15288,e=>{"use strict";var a=e.i(43476),s=e.i(71645),t=e.i(75157);let r=s.forwardRef(({className:e,...s},r)=>(0,a.jsx)("div",{ref:r,className:(0,t.cn)("rounded-xl border bg-card text-card-foreground shadow-sm glass-card transition-all duration-300 hover:shadow-md hover:border-primary/20",e),...s}));r.displayName="Card";let i=s.forwardRef(({className:e,...s},r)=>(0,a.jsx)("div",{ref:r,className:(0,t.cn)("flex flex-col space-y-1.5 p-6",e),...s}));i.displayName="CardHeader";let n=s.forwardRef(({className:e,...s},r)=>(0,a.jsx)("h3",{ref:r,className:(0,t.cn)("text-2xl font-semibold leading-none tracking-tight text-gradient",e),...s}));n.displayName="CardTitle";let o=s.forwardRef(({className:e,...s},r)=>(0,a.jsx)("p",{ref:r,className:(0,t.cn)("text-sm text-muted-foreground",e),...s}));o.displayName="CardDescription";let d=s.forwardRef(({className:e,...s},r)=>(0,a.jsx)("div",{ref:r,className:(0,t.cn)("p-6 pt-0",e),...s}));d.displayName="CardContent";let l=s.forwardRef(({className:e,...s},r)=>(0,a.jsx)("div",{ref:r,className:(0,t.cn)("flex items-center p-6 pt-0",e),...s}));l.displayName="CardFooter",e.s(["Card",()=>r,"CardContent",()=>d,"CardDescription",()=>o,"CardFooter",()=>l,"CardHeader",()=>i,"CardTitle",()=>n])},87486,e=>{"use strict";var a=e.i(43476),s=e.i(25913),t=e.i(75157);let r=(0,s.cva)("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",{variants:{variant:{default:"border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_10px_-3px_var(--color-primary)]",secondary:"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",destructive:"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",outline:"text-foreground",glass:"border-transparent bg-white/10 text-white backdrop-blur-md hover:bg-white/20"}},defaultVariants:{variant:"default"}});function i({className:e,variant:s,...i}){return(0,a.jsx)("div",{className:(0,t.cn)(r({variant:s}),e),...i})}e.s(["Badge",()=>i])},77572,e=>{"use strict";var a=e.i(43476),s=e.i(71645),t=e.i(81140),r=e.i(42727),i=e.i(96626);e.i(74080);var n=e.i(20783),o=Symbol("radix.slottable");function d(e){return s.isValidElement(e)&&"function"==typeof e.type&&"__radixId"in e.type&&e.type.__radixId===o}var l=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"].reduce((e,t)=>{var r,i;let o,l,c,m=(i=r=`Primitive.${t}`,(o=s.forwardRef((e,a)=>{let{children:t,...r}=e;if(s.isValidElement(t)){var i;let e,o,d=(i=t,(o=(e=Object.getOwnPropertyDescriptor(i.props,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning)?i.ref:(o=(e=Object.getOwnPropertyDescriptor(i,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning)?i.props.ref:i.props.ref||i.ref),l=function(e,a){let s={...a};for(let t in a){let r=e[t],i=a[t];/^on[A-Z]/.test(t)?r&&i?s[t]=(...e)=>{let a=i(...e);return r(...e),a}:r&&(s[t]=r):"style"===t?s[t]={...r,...i}:"className"===t&&(s[t]=[r,i].filter(Boolean).join(" "))}return{...e,...s}}(r,t.props);return t.type!==s.Fragment&&(l.ref=a?(0,n.composeRefs)(a,d):d),s.cloneElement(t,l)}return s.Children.count(t)>1?s.Children.only(null):null})).displayName=`${i}.SlotClone`,l=o,(c=s.forwardRef((e,t)=>{let{children:r,...i}=e,n=s.Children.toArray(r),o=n.find(d);if(o){let e=o.props.children,r=n.map(a=>a!==o?a:s.Children.count(e)>1?s.Children.only(null):s.isValidElement(e)?e.props.children:null);return(0,a.jsx)(l,{...i,ref:t,children:s.isValidElement(e)?s.cloneElement(e,void 0,r):null})}return(0,a.jsx)(l,{...i,ref:t,children:r})})).displayName=`${r}.Slot`,c),u=s.forwardRef((e,s)=>{let{asChild:r,...i}=e;return"undefined"!=typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,a.jsx)(r?m:t,{...i,ref:s})});return u.displayName=`Primitive.${t}`,{...e,[t]:u}},{}),c=e.i(86318),m=e.i(69340),u=e.i(10772),p="Tabs",[x,h]=function(e,t=[]){let r=[],i=()=>{let a=r.map(e=>s.createContext(e));return function(t){let r=t?.[e]||a;return s.useMemo(()=>({[`__scope${e}`]:{...t,[e]:r}}),[t,r])}};return i.scopeName=e,[function(t,i){let n=s.createContext(i),o=r.length;r=[...r,i];let d=t=>{let{scope:r,children:i,...d}=t,l=r?.[e]?.[o]||n,c=s.useMemo(()=>d,Object.values(d));return(0,a.jsx)(l.Provider,{value:c,children:i})};return d.displayName=t+"Provider",[d,function(a,r){let d=r?.[e]?.[o]||n,l=s.useContext(d);if(l)return l;if(void 0!==i)return i;throw Error(`\`${a}\` must be used within \`${t}\``)}]},function(...e){let a=e[0];if(1===e.length)return a;let t=()=>{let t=e.map(e=>({useScope:e(),scopeName:e.scopeName}));return function(e){let r=t.reduce((a,{useScope:s,scopeName:t})=>{let r=s(e)[`__scope${t}`];return{...a,...r}},{});return s.useMemo(()=>({[`__scope${a.scopeName}`]:r}),[r])}};return t.scopeName=a.scopeName,t}(i,...t)]}(p,[r.createRovingFocusGroupScope]),g=(0,r.createRovingFocusGroupScope)(),[f,j]=x(p),v=s.forwardRef((e,s)=>{let{__scopeTabs:t,value:r,onValueChange:i,defaultValue:n,orientation:o="horizontal",dir:d,activationMode:x="automatic",...h}=e,g=(0,c.useDirection)(d),[j,v]=(0,m.useControllableState)({prop:r,onChange:i,defaultProp:n??"",caller:p});return(0,a.jsx)(f,{scope:t,baseId:(0,u.useId)(),value:j,onValueChange:v,orientation:o,dir:g,activationMode:x,children:(0,a.jsx)(l.div,{dir:g,"data-orientation":o,...h,ref:s})})});v.displayName=p;var y="TabsList",b=s.forwardRef((e,s)=>{let{__scopeTabs:t,loop:i=!0,...n}=e,o=j(y,t),d=g(t);return(0,a.jsx)(r.Root,{asChild:!0,...d,orientation:o.orientation,dir:o.dir,loop:i,children:(0,a.jsx)(l.div,{role:"tablist","aria-orientation":o.orientation,...n,ref:s})})});b.displayName=y;var N="TabsTrigger",C=s.forwardRef((e,s)=>{let{__scopeTabs:i,value:n,disabled:o=!1,...d}=e,c=j(N,i),m=g(i),u=q(c.baseId,n),p=E(c.baseId,n),x=n===c.value;return(0,a.jsx)(r.Item,{asChild:!0,...m,focusable:!o,active:x,children:(0,a.jsx)(l.button,{type:"button",role:"tab","aria-selected":x,"aria-controls":p,"data-state":x?"active":"inactive","data-disabled":o?"":void 0,disabled:o,id:u,...d,ref:s,onMouseDown:(0,t.composeEventHandlers)(e.onMouseDown,e=>{o||0!==e.button||!1!==e.ctrlKey?e.preventDefault():c.onValueChange(n)}),onKeyDown:(0,t.composeEventHandlers)(e.onKeyDown,e=>{[" ","Enter"].includes(e.key)&&c.onValueChange(n)}),onFocus:(0,t.composeEventHandlers)(e.onFocus,()=>{let e="manual"!==c.activationMode;x||o||!e||c.onValueChange(n)})})})});C.displayName=N;var T="TabsContent",w=s.forwardRef((e,t)=>{let{__scopeTabs:r,value:n,forceMount:o,children:d,...c}=e,m=j(T,r),u=q(m.baseId,n),p=E(m.baseId,n),x=n===m.value,h=s.useRef(x);return s.useEffect(()=>{let e=requestAnimationFrame(()=>h.current=!1);return()=>cancelAnimationFrame(e)},[]),(0,a.jsx)(i.Presence,{present:o||x,children:({present:s})=>(0,a.jsx)(l.div,{"data-state":x?"active":"inactive","data-orientation":m.orientation,role:"tabpanel","aria-labelledby":u,hidden:!s,id:p,tabIndex:0,...c,ref:t,style:{...e.style,animationDuration:h.current?"0s":void 0},children:s&&d})})});function q(e,a){return`${e}-trigger-${a}`}function E(e,a){return`${e}-content-${a}`}w.displayName=T;var R=e.i(75157);let A=s.forwardRef(({className:e,...s},t)=>(0,a.jsx)(b,{ref:t,className:(0,R.cn)("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",e),...s}));A.displayName=b.displayName;let k=s.forwardRef(({className:e,...s},t)=>(0,a.jsx)(C,{ref:t,className:(0,R.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",e),...s}));k.displayName=C.displayName;let P=s.forwardRef(({className:e,...s},t)=>(0,a.jsx)(w,{ref:t,className:(0,R.cn)("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",e),...s}));P.displayName=w.displayName,e.s(["Tabs",()=>v,"TabsContent",()=>P,"TabsList",()=>A,"TabsTrigger",()=>k],77572)},70756,e=>{"use strict";let a=(0,e.i(75254).default)("lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);e.s(["Lock",()=>a],70756)},58472,e=>{"use strict";let a=(0,e.i(75254).default)("code",[["path",{d:"m16 18 6-6-6-6",key:"eg8j8"}],["path",{d:"m8 6-6 6 6 6",key:"ppft3o"}]]);e.s(["Code",()=>a],58472)},74886,e=>{"use strict";let a=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",()=>a],74886)},48687,e=>{"use strict";var a=e.i(43476),s=e.i(71645),t=e.i(74886),r=e.i(43531),i=e.i(58472),n=e.i(70756),o=e.i(61911),d=e.i(88844),l=e.i(87316),c=e.i(15288),m=e.i(77572),u=e.i(19455),p=e.i(87486);function x(){let[e,x]=(0,s.useState)(null),h=(e,a)=>{navigator.clipboard.writeText(e),x(a),setTimeout(()=>x(null),2e3)},g={equipments:[{method:"GET",path:"/api/equipments",description:"Lista todos os equipamentos disponíveis",authRequired:!0,requestExample:[{language:"javascript",code:`fetch('/api/equipments', {
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
}`}]};return(0,a.jsxs)("div",{className:"p-8 max-w-6xl mx-auto space-y-8",children:[(0,a.jsxs)("div",{className:"text-center space-y-4",children:[(0,a.jsx)("div",{className:"flex justify-center",children:(0,a.jsx)(i.Code,{className:"h-12 w-12 text-primary"})}),(0,a.jsx)("h1",{className:"text-4xl font-bold font-headline tracking-wide",children:"Documentação da API"}),(0,a.jsx)("p",{className:"text-muted-foreground text-lg",children:"Integre seu sistema com nossa API RESTful"})]}),(0,a.jsxs)(c.Card,{children:[(0,a.jsxs)(c.CardHeader,{children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)(n.Lock,{className:"h-5 w-5"}),(0,a.jsx)(c.CardTitle,{className:"font-headline tracking-wide",children:"Autenticação"})]}),(0,a.jsx)(c.CardDescription,{children:"Como autenticar suas requisições"})]}),(0,a.jsxs)(c.CardContent,{className:"space-y-4",children:[(0,a.jsx)("p",{className:"text-sm text-muted-foreground",children:"A API utiliza autenticação baseada em sessão. Você deve estar logado no sistema para fazer requisições. As requisições devem incluir cookies de sessão."}),(0,a.jsx)("div",{className:"bg-muted p-4 rounded-lg",children:(0,a.jsx)("p",{className:"text-sm font-mono",children:"credentials: 'include' // JavaScript Fetch"})}),(0,a.jsxs)("div",{className:"flex items-start gap-2 p-4 bg-primary/10 dark:bg-primary/20 rounded-lg",children:[(0,a.jsx)(n.Lock,{className:"h-5 w-5 text-primary mt-0.5"}),(0,a.jsxs)("div",{className:"text-sm",children:[(0,a.jsx)("p",{className:"font-medium text-foreground",children:"Importante"}),(0,a.jsx)("p",{className:"text-muted-foreground",children:"Todas as requisições devem ser feitas de domínios autorizados. Requisições de origens não autorizadas serão bloqueadas por CORS."})]})]})]})]}),(0,a.jsxs)(c.Card,{children:[(0,a.jsxs)(c.CardHeader,{children:[(0,a.jsx)(c.CardTitle,{className:"font-headline tracking-wide",children:"Endpoints Disponíveis"}),(0,a.jsx)(c.CardDescription,{children:"Explore os endpoints organizados por recurso"})]}),(0,a.jsx)(c.CardContent,{children:(0,a.jsxs)(m.Tabs,{defaultValue:"equipments",className:"space-y-6",children:[(0,a.jsxs)(m.TabsList,{className:"grid w-full grid-cols-4",children:[(0,a.jsxs)(m.TabsTrigger,{value:"equipments",children:[(0,a.jsx)(d.Package,{className:"h-4 w-4 mr-2"}),"Equipamentos"]}),(0,a.jsxs)(m.TabsTrigger,{value:"customers",children:[(0,a.jsx)(o.Users,{className:"h-4 w-4 mr-2"}),"Clientes"]}),(0,a.jsxs)(m.TabsTrigger,{value:"bookings",children:[(0,a.jsx)(l.Calendar,{className:"h-4 w-4 mr-2"}),"Reservas"]}),(0,a.jsxs)(m.TabsTrigger,{value:"users",children:[(0,a.jsx)(o.Users,{className:"h-4 w-4 mr-2"}),"Usuários"]})]}),Object.entries(g).map(([s,i])=>(0,a.jsx)(m.TabsContent,{value:s,className:"space-y-6",children:i.map((s,i)=>(0,a.jsxs)("div",{className:"border rounded-lg p-6 space-y-4",children:[(0,a.jsxs)("div",{className:"flex items-start justify-between",children:[(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsxs)("div",{className:"flex items-center gap-3",children:[(0,a.jsx)(p.Badge,{variant:"GET"===s.method||"POST"===s.method?"default":"destructive",className:"GET"===s.method?"bg-green-600":"POST"===s.method?"bg-primary":"",children:s.method}),(0,a.jsx)("code",{className:"text-sm font-mono bg-muted px-2 py-1 rounded",children:s.path})]}),(0,a.jsx)("p",{className:"text-sm text-muted-foreground",children:s.description}),s.roles&&(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)(n.Lock,{className:"h-3 w-3 text-orange-600"}),(0,a.jsxs)("span",{className:"text-xs text-orange-600",children:["Requer papel: ",s.roles.join(", ")]})]})]}),s.authRequired&&(0,a.jsx)(n.Lock,{className:"h-4 w-4 text-muted-foreground"})]}),s.requestExample&&(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)("h4",{className:"text-sm font-medium",children:"Exemplo de Requisição:"}),(0,a.jsxs)(m.Tabs,{defaultValue:s.requestExample[0].language,children:[(0,a.jsx)(m.TabsList,{children:s.requestExample.map(e=>(0,a.jsx)(m.TabsTrigger,{value:e.language,children:"javascript"===e.language?"JavaScript":"Python"},e.language))}),s.requestExample.map(i=>(0,a.jsx)(m.TabsContent,{value:i.language,children:(0,a.jsxs)("div",{className:"relative",children:[(0,a.jsx)("pre",{className:"bg-muted p-4 rounded-lg overflow-x-auto text-sm",children:(0,a.jsx)("code",{children:i.code})}),(0,a.jsx)(u.Button,{size:"sm",variant:"ghost",className:"absolute top-2 right-2",onClick:()=>h(i.code,`${s.path}-${i.language}`),children:e===`${s.path}-${i.language}`?(0,a.jsx)(r.Check,{className:"h-4 w-4"}):(0,a.jsx)(t.Copy,{className:"h-4 w-4"})})]})},i.language))]})]}),s.responseExample&&(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)("h4",{className:"text-sm font-medium",children:"Exemplo de Resposta:"}),(0,a.jsxs)("div",{className:"relative",children:[(0,a.jsx)("pre",{className:"bg-muted p-4 rounded-lg overflow-x-auto text-sm",children:(0,a.jsx)("code",{children:s.responseExample})}),(0,a.jsx)(u.Button,{size:"sm",variant:"ghost",className:"absolute top-2 right-2",onClick:()=>h(s.responseExample,`${s.path}-response`),children:e===`${s.path}-response`?(0,a.jsx)(r.Check,{className:"h-4 w-4"}):(0,a.jsx)(t.Copy,{className:"h-4 w-4"})})]})]})]},i))},s))]})})]}),(0,a.jsxs)(c.Card,{children:[(0,a.jsxs)(c.CardHeader,{children:[(0,a.jsx)(c.CardTitle,{className:"font-headline tracking-wide",children:"Códigos de Status HTTP"}),(0,a.jsx)(c.CardDescription,{children:"Códigos de resposta que a API pode retornar"})]}),(0,a.jsx)(c.CardContent,{children:(0,a.jsx)("div",{className:"space-y-3",children:[{code:200,description:"Requisição bem-sucedida"},{code:201,description:"Recurso criado com sucesso"},{code:400,description:"Dados inválidos ou requisição mal formatada"},{code:401,description:"Não autenticado - faça login primeiro"},{code:403,description:"Sem permissão para acessar este recurso"},{code:404,description:"Recurso não encontrado"},{code:500,description:"Erro interno do servidor"}].map(e=>(0,a.jsx)("div",{className:"flex items-center justify-between p-3 border rounded-lg",children:(0,a.jsxs)("div",{className:"flex items-center gap-3",children:[(0,a.jsx)(p.Badge,{variant:e.code>=200&&e.code<300?"default":e.code>=400&&e.code<500?"secondary":"destructive",className:e.code>=200&&e.code<300?"bg-green-600":e.code>=400&&e.code<500?"bg-accent":"",children:e.code}),(0,a.jsx)("span",{className:"text-sm",children:e.description})]})},e.code))})})]}),(0,a.jsxs)(c.Card,{children:[(0,a.jsxs)(c.CardHeader,{children:[(0,a.jsx)(c.CardTitle,{className:"font-headline tracking-wide",children:"Boas Práticas"}),(0,a.jsx)(c.CardDescription,{children:"Recomendações para usar a API de forma eficiente"})]}),(0,a.jsx)(c.CardContent,{children:(0,a.jsxs)("ul",{className:"space-y-3 text-sm",children:[(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[(0,a.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,a.jsxs)("div",{children:[(0,a.jsx)("strong",{children:"Sempre verifique o status HTTP"})," antes de processar a resposta"]})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[(0,a.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,a.jsxs)("div",{children:[(0,a.jsx)("strong",{children:"Implemente retry logic"})," para requisições que falharem por erro temporário"]})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[(0,a.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,a.jsxs)("div",{children:[(0,a.jsx)("strong",{children:"Use cache"})," para dados que não mudam frequentemente"]})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[(0,a.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,a.jsxs)("div",{children:[(0,a.jsx)("strong",{children:"Valide os dados"})," no cliente antes de enviar para a API"]})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[(0,a.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,a.jsxs)("div",{children:[(0,a.jsx)("strong",{children:"Trate erros adequadamente"})," e forneça feedback claro ao usuário"]})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[(0,a.jsx)("div",{className:"w-1.5 h-1.5 rounded-full bg-primary mt-2"}),(0,a.jsxs)("div",{children:[(0,a.jsx)("strong",{children:"Não exponha credenciais"})," no código do cliente"]})]})]})})]}),(0,a.jsxs)(c.Card,{className:"bg-card border-border",children:[(0,a.jsxs)(c.CardHeader,{children:[(0,a.jsx)(c.CardTitle,{className:"font-headline tracking-wide",children:"Limites de Taxa"}),(0,a.jsx)(c.CardDescription,{children:"Informações sobre limites de requisições"})]}),(0,a.jsx)(c.CardContent,{children:(0,a.jsx)("p",{className:"text-sm text-muted-foreground",children:"Atualmente não há limites de taxa implementados, mas recomendamos fazer no máximo 100 requisições por minuto para garantir a estabilidade do sistema. Limites mais rigorosos podem ser implementados no futuro."})})]})]})}e.s(["default",()=>x])}]);