# Bookrooms Project


This project aims to create a fundamentally new room booking system to make it easier for students and university staff to use.

## Table of Contents

- [How to start](#start)
- [How to use](#use)
- [Features](#features)
- [Resources](#resources)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

## How to start<a name='start' />

You can access this application by https://bookrooms.gladov.ru . However, if you want to run it on your local host, you should:
 
- clone this repository
- execute "npm i' for modules
- execute "npm run dev' to run in developing mode
- or execute "npm run build" for building to production

- or execute "npm run preview" for preview.

## How to use<a name='use' />

You can choose room that you want to book in left-side interface. If you want to apply some filters, you can choose floor on bottom button, choose type of room, date and time inside filter block above rooms.
###
Also, you can gain access to 3D models of rooms and floors for better interaction with them. Moreover, the rooms on the map are linked to the rooms in the list on the left, and when you press the right arrow on the button for booking a room, you can target the same room already on the 3D model!

## Features

- **Svelte:** A framework for building reactive user interfaces.
- **Three.js:** A JavaScript library for creating 3D graphics.
- **Reactive Animations:** Leverage Svelte's reactivity to create dynamic animations.
- **Component-based Architecture:** Organize the application into reusable components.

I decided to use Svelte for build website for a several reasons:
- Svelte compiles into pure java script code, which ensures optimized page performance.

- Svelte allows you to have a “store” of reactive variables that are available for change on all project components, which greatly facilitates the interaction of all windows, filters, data flows from the server, etc.

## Resources

All 3d models of Innopolis Univesity which are used in this project available in ```.fbx``` format at ```public``` directory. 

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

Please ensure your code adheres to the project's coding standards and includes appropriate tests.

## Acknowledgments

- [Svelte](https://svelte.dev/)
- [Three.js](https://threejs.org/)
- [Bookroms site](https://bookrooms.gladov.ru/)

