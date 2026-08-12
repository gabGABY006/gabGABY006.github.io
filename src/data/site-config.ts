import avatar from '../assets/images/about.jpg';
import hero from '../assets/images/hero.jpg';
import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://gabGABY006.github.io',
    avatar: {
        src: avatar,
        alt: 'Gabriella Castro'
    },
    title: 'Gabriella Castro',
    subtitle: 'Estudiante de Ingeniería de Sistemas | Entusiasta y desarrolladora UX/UI',
    description: 'Portafolio personal y blog tecnológico de Gabriella Castro. Explorando diseño UX/UI, ingeniería de software, creaciones en Figma, algoritmos y desarrollo web.',
    image: {
        src: '/dante-preview.jpg',
        alt: 'Portafolio de Gabriella Castro'
    },
    headerNavLinks: [
        {
            text: 'Inicio',
            href: '/'
        },
        {
            text: 'Acerca de',
            href: '/acerca'
        },
        {
            text: 'Evidencias',
            href: '/evidencias'
        },
        {
            text: 'Proyectos',
            href: '/projects'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'GitHub',
            href: 'https://github.com/gabgaby006'
        }
    ],
    footerNavLinks: [
        {
            text: 'Acerca de',
            href: '/acerca'
        },
        {
            text: 'Evidencias',
            href: '/evidencias'
        },
        {
            text: 'Proyectos',
            href: '/projects'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'Contacto',
            href: '/contact'
        }
    ],
    socialLinks: [
        {
            text: 'GitHub',
            href: 'https://github.com/gabgaby006'
        },
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/gabriella-michelle-castro-cuello-257283363/'
        },
        {
            text: 'Instagram',
            href: 'https://www.instagram.com/gabycas2007/'
        }
    ],
    hero: {
        title: '¡Hola! Bienvenido a mi rincón de la web.',
        text: "Soy **Gabriella Castro**, estudiante de Ingeniería de Sistemas apasionada por el **diseño UX/UI**, el desarrollo de software y los proyectos digitales creativos.\n\nCuando no estoy resolviendo desafíos algorítmicos, me encontrarás diseñando conceptos de interfaz en **Figma** (como cartas estilo Pokémon personalizadas), siguiendo la **Fórmula 1** o experimentando con nuevas pilas tecnológicas web.\n\nSi quieres, explora mi código abierto en [GitHub](https://github.com/gabgaby006), revisa mi trabajo más reciente en la página de [Proyectos](/projects) o lee mis publicaciones en el [Blog](/blog)!",
        image: {
            src: hero,
            alt: 'Configuración del espacio de trabajo'
        },
        actions: [
            {
                text: 'Ver proyectos',
                href: '/projects'
            },
            {
                text: 'Ponte en contacto',
                href: '/contact'
            }
        ]
    },
    subscribe: {
        enabled: true,
        title: 'Suscríbete a las actualizaciones',
        text: 'Recibe avisos cuando publique nuevos artículos, escritos de proyectos o notas técnicas.',
        form: {
            action: '#'
        }
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;