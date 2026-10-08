# Prompt Log

## AI Model Information
Claude Sonnet for initial planning and skeleton code
ChatGPT Codex VSCode Extension for in editor iterating

## Development Process Summary
After initial brainstorming and some default code by Claude, I started my repo and copy pasting some code over, then began iterating on the output with Codex. A lot of initial setup was done manually (e.g. using firebase) and changing text to be what I wanted, but major structural edits were done by AI. 

One place where AI did poorly was debugging some Github connected things. When deploying between render and Github, AI struggled (took a long time but eventually figured it out) to figure out why my Github deployment had errors.  

## Prompts
ideas for this? Goal: Design and implement a creative, portfolio-ready web application while using AI effectively as part of your process. This project emphasizes attention to detail, thoughtful use of AI, clear documentation of your process, and demonstrable learning since the start of the semester.
Timeline: Roughly 10 days to complete. Expect to spend about 8 hours of focused work.
Why This Matters: This assignment asks you to combine your technical skills with responsible and strategic AI usage to produce a project you can show in interviews and on your portfolio.
Examples of what you might build:

* An interactive character that showcases persona design, with sort of graphical representation, memory between visits, and safe prompt management
* Some sort of useful web tool that uses a third-party API and stores user data (securely) on a backend, with a nicely-designed frontend
* A visualization dashboard that performs meaningful data analysis and interactive graphical exploration of a public dataset
* A web-based game that uses computer vision as part of its core mechanic

Note: We expect you to understand and be able to explain what each part of the code is responsible for, and you'll need to write or substantially modify at least some of your code, so be careful not to just vibe-code until it's too complicated for you to grasp. As you work, ask yourself this: Would you be comfortable discussing this project in an in-person technical job interview, without notes? If not, begin investing effort in understanding the code the AI has written for you, or focus on simplifying the project until you feel you understand and can discuss it.

i think a wishlist would be good but wasnt it hard to figure out how to scrape prices of things? and if i want my wishlist to be in notion, how would i make a web page interafce? would i just make a webpage interface for everyone else who doesnt use ntoino?


i would use it! and although i would use it with notion, can we make it so that it has a web interface? as long as it satisfies An interactive character that showcases persona design, with sort of graphical representation, memory between visits, and safe prompt management

* Some sort of useful web tool that uses a third-party API and stores user data (securely) on a backend, with a nicely-designed frontend
* A visualization dashboard that performs meaningful data analysis and interactive graphical exploration of a public dataset
* A web-based game that uses computer vision as part of its core mechanic


what api would i use, what would it have on frontend, how would it scrape info?

wait i would want it instead fo be like frontend is your database (and maybe it's connected to notion's database) and then maybe somethign like a chrome extension that actually gets the link of whatever webbsite youre currently on

this looks good! what is firestore before we begin and are ther alternatives? and then would we need any other api's other than notion api? im just a bit worried if the notion api is kinda optional since ppl ight opt out of notion lol

let's start, but i probably want more direction on how to do this since ive never used firestore, although i have made extensions before

ok so i put it in, nowshould popup html and popup.js be in a new folder or is it fine here? and then server js is in the back?and can we do it so that you can add yoru own categories

ok so heres my tree, does nyathing need to be fixed? and then what should go in each file or do i need to start doing stuff with render now? or firebase?

yes! also did you address making your own cateogires i forgot

is there ay other way to cehck which part of my keys are incorect?

node:internal/modules/cjs/loader:1479
  throw err;
  ^

Error: Cannot find module '/Users/eclai/Desktop/Eileen/Code/wishlist/server.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1476:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1049:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1073:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1094:12)
    at Module._load (node:internal/modules/cjs/loader:1262:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

node server.js
Firebase admin imported
◇ injected env (3) from .env
About to initialize Firebase
Firebase init failed: Cannot read properties of undefined (reading 'cert')


can you post the whole server.js file

ok just talked to my ta and she recommended supabase if im having a lot of trouble wiht firebase. thoughts?

it works now, and updated! should i load the exntesion ifolder into my google chrome extensions?

for html can you make so it so you can create your own category as an oiption if none of the ones are good? maybe in the dropdown, the first option can be "create new" or like in notion when youre typing something and it doesnt hsow up it should be like "create "whatever u typed" category"

ok so we have a backend with connection to database, and frontend is website with seeing what we have and then extension popup. can we make stuff look better and just make this better overall? not sure what i want

ok. shoul di push these to my github and see if it works with my backend on render?

ok can you add firebase signin and reduce the extension permissions? also why does my render this website https://wishlist-yu2x.onrender.com cannot GET/ but on my deploy side its fine?

how to enable email password, where is firebase authentication sign in

can i use the googl eone? or just email

ok which files should i add before i commit

would it be on my github link if i havent pushedeverything to github yet but it pribably sirtll exists there

wait is there any way for this github pages to be via deploy via branch rather than github actions

can you create forgot passowrd, i did a random password but i didnt save it so i cant login

ok while we're waiting because its still taking very long to deploy, can we change the ui? i want it to be a bit more cutesy but still elegant like maybe the vibes of the attached photo

could you make it less vibecoded looking and more maybe modular? i want it to look more unique and less just like basic html. also could you write a readme while youre at it with basic functionality, how backend and frontend connect, how to use it as a user

ok i think this is chill for now. how can i test the extension? i think the one i have loaded right now is local. could you also put instructions for installing and using the extension on the frontned website itself?

ok sounds good, so is the one i loaded on my local computer sycned to the one on my github? and then does everything look safe t opush to github?

