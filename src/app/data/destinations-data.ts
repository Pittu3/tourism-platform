export interface Destination {
  id: number;
  name: string;
  location: string;
  duration: string;
  image: string;
  description: string;
  coords: {
    lat: number;
    lng: number;
  }
}

const destinationSeeds: Omit<Destination, 'id'>[] = [
  {
    name: 'Tirumala Tirupathi',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://3.bp.blogspot.com/-eKlAydd6GDw/U9DtLeczIzI/AAAAAAAAFmo/6RMDHTcIH4Q/s1600/Tirupati+Balaji+Temple.jpg',
    description: 'Perched atop the sacred Tirumala Hills, Tirumala Tirupathi is one of the most revered pilgrimage sites in India. The ancient Venkateswara Temple, dedicated to Lord Vishnu, attracts millions of devotees each year who climb the 3,500 steps or take the scenic ghat road. The temple complex features stunning Dravidian architecture with intricate carvings and golden domes that shimmer in the mountain sunlight. The spiritual atmosphere, combined with breathtaking views of the Eastern Ghats, creates an unforgettable experience of divine beauty and tranquility.',
    coords: { lat: 13.6833, lng: 79.3470 }
  },
  {
    name: 'Meenakshi Amman Temple',
    location: 'Madurai, Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://static.toiimg.com/thumb/msid-59381768,width=1200,height=900/59381768.jpg',
    description: 'The magnificent Meenakshi Amman Temple is a masterpiece of Dravidian architecture and one of South India\'s most iconic landmarks. This sprawling temple complex features 14 towering gopurams (gateway towers) adorned with over 33,000 colorful sculptures depicting Hindu mythology. The Hall of Thousand Pillars houses intricately carved stone columns, each unique in design. As the sun sets, the temple transforms into a golden wonder, with the twin shrines of Meenakshi and Sundareshwar creating a divine atmosphere that has captivated visitors for over 2,500 years.',
    coords: { lat: 9.9195, lng: 78.1193 }
  },
  {
    name: 'Ramanathaswamy Temple',
    location: 'Rameswaram, Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://tse1.mm.bing.net/th/id/OIP.dhWy2r5QUmisr1derQSL8AHaEK?pid=Api&P=0&h=220',
    description: 'Located on the sacred island of Rameswaram, the Ramanathaswamy Temple is one of the twelve Jyotirlinga shrines dedicated to Lord Shiva. The temple is renowned for its breathtaking architecture, featuring the longest corridor among all Hindu temples in India, stretching over 1,200 meters with 1,212 exquisitely carved pillars. The temple\'s golden towers rise majestically against the backdrop of the azure Bay of Bengal. According to legend, Lord Rama himself worshipped Shiva here, making it one of the holiest pilgrimage sites in India.',
    coords: { lat: 9.2881, lng: 79.3174 }
  },
  {
    name: 'Brihadeeswarar Temple',
    location: 'Thanjavur, Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://i.ytimg.com/vi/KC3GAmjn1mg/maxresdefault.jpg',
    description: 'The Brihadeeswarar Temple, also known as the Big Temple, is a UNESCO World Heritage Site and a marvel of Chola architecture. Built in the 11th century by Emperor Raja Raja Chola I, this grand temple features a 66-meter high vimana (tower) that appears to touch the sky. The temple\'s massive Nandi bull statue, carved from a single rock, guards the entrance. The intricate frescoes and inscriptions on the walls tell stories of the Chola dynasty\'s glory, while the temple\'s acoustics create magical echoes that have fascinated visitors for centuries.',
    coords: { lat: 10.7828, lng: 79.1317 }
  },
  {
    name: 'Chidambaram Nataraja Temple',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://hblimg.mmtcdn.com/content/hubble/img/dest_images/mmt/activities/m_Chidambaram_landscape_1_l_634_950.jpg',
    description: 'The Chidambaram Nataraja Temple is a sacred abode of Lord Shiva in his cosmic dance form, Nataraja. This ancient temple is one of the Pancha Bhoota Stalas, representing the element of ether (akasha). The temple\'s golden roof symbolizes the infinite cosmos, while the dance hall (Chit Sabha) houses the divine Nataraja idol. The intricate carvings throughout the temple depict various dance poses from the Natya Shastra, making it a living museum of classical Indian dance and architecture.',
    coords: { lat: 11.3996, lng: 79.6936 }
  },
  {
    name: 'Simhachalam Temple',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://media.tripinvites.com/places/visakhapatnam/simhachalam-temple/the-simhachalam-temple-featured.jpg',
    description: 'Perched on the Simhachalam Hill Range near Visakhapatnam, this ancient temple is dedicated to Lord Narasimha, an incarnation of Lord Vishnu. The temple\'s unique architecture blends Kalinga and Dravidian styles, with the main shrine built in the shape of a lion\'s head. What makes this temple special is that the deity is covered with sandalwood paste throughout the year, except on Akshaya Tritiya when the original form is revealed. The temple offers panoramic views of Visakhapatnam city and the Bay of Bengal, creating a perfect blend of spiritual serenity and natural beauty.',
    coords: { lat: 17.7669, lng: 83.2506 }
  },
  {
    name: 'Lepakshi Veerabhadra Temple',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://www.templepurohit.com/wp-content/uploads/2015/08/Lepakshi-Temple.jpg',
    description: 'Nestled in the foothills of the Seshachalam Hills, the Lepakshi Veerabhadra Temple is a masterpiece of Vijayanagara architecture. The temple is famous for its hanging pillar, one of 70 that appear to defy gravity, and the massive Nandi bull statue carved from a single stone. The temple walls are adorned with exquisite frescoes depicting scenes from the epics, while the intricate carvings tell stories of divine power and cosmic balance. According to legend, this is where Jatayu, the divine eagle from the Ramayana, fell after his battle with Ravana.',
    coords: { lat: 13.8006, lng: 77.6050 }
  },
  {
    name: 'Yadadri Temple',
    location: 'Telangana',
    duration: '2D / 1N',
    image: 'https://tse2.mm.bing.net/th/id/OIP.2whmNXvGTGhi5rUFcgeWNQHaEK?pid=Api&P=0&h=220',
    description: 'The majestic Sri Lakshmi Narasimha Swamy Temple at Yadadri is a stunning example of ancient Agama Shilpa architecture. Perched atop a hillock, this temple complex features five shrines dedicated to different forms of Lord Narasimha. The temple\'s towering gopurams and intricate carvings showcase the grandeur of South Indian temple architecture. The serene atmosphere, combined with the surrounding natural beauty of the Nalgonda district, makes it a perfect destination for spiritual seekers and architecture enthusiasts alike.',
    coords: { lat: 17.5866, lng: 78.9433 }
  },
  {
    name: 'Guruvayur Temple',
    location: 'Kerala',
    duration: '2D / 1N',
    image: 'https://tse4.mm.bing.net/th/id/OIP.3BqTD9ZWWyxjPXPsM0Xz8QHaEH?pid=Api&P=0&h=220',
    description: 'Known as the "Dwarka of the South," the Guruvayur Temple is one of Kerala\'s most sacred pilgrimage sites. Dedicated to Lord Krishna as Guruvayurappan, this ancient temple is believed to have been established by Lord Brahma himself. The temple\'s golden spires rise gracefully against the sky, while the inner sanctum houses the divine idol of Guruvayurappan. The temple is famous for its daily rituals, especially the "Udayasthamaya" pooja, and the majestic elephants that grace the temple grounds add to its spiritual charm.',
    coords: { lat: 10.5943, lng: 76.0413 }
  },
  {
    name: 'Tiruchendur Murugan Temple',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://kandhan.org/wp-content/uploads/2024/01/Tiruchendur_koil.jpeg',
    description: 'Situated on the shores of the Bay of Bengal, the Tiruchendur Murugan Temple is one of the six sacred abodes of Lord Murugan. This ancient temple is unique as it is the only one among the six abodes located on the seashore. The temple\'s majestic gopurams rise against the backdrop of the endless ocean, creating a breathtaking sight. The rhythmic sound of waves combined with temple bells creates a divine symphony that soothes the soul. The temple is especially famous for its grand festivals, particularly the Skanda Sashti celebration that attracts thousands of devotees.',
    coords: { lat: 8.4971, lng: 78.1193 }
  },
  {
    name: 'Hampi',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://karnatakatourism.org/wp-content/uploads/2020/05/Hampi.jpg',
    description: 'The ancient city of Hampi, once the glorious capital of the Vijayanagara Empire, is now a UNESCO World Heritage Site that transports visitors back to a golden age of architecture and culture. Scattered across dramatic boulder-strewn landscapes, the ruins of Hampi include magnificent temples, royal complexes, and market streets that whisper tales of a bygone era. The iconic Virupaksha Temple, the stone chariot at Vittala Temple, and the musical pillars that produce different notes when struck are just a few of the wonders that make Hampi one of India\'s most captivating historical destinations.',
    coords: { lat: 15.3350, lng: 76.4600 }
  },
  {
    name: 'Charminar',
    location: 'Hyderabad, Telangana',
    duration: '2D / 1N',
    image: 'https://wallpaperaccess.com/full/4495586.jpg',
    description: 'The iconic Charminar stands as the heart and soul of Hyderabad, a magnificent monument built in 1591 by Muhammad Quli Qutb Shah. This architectural marvel features four grand arches facing the cardinal directions, each adorned with intricate stucco work and delicate carvings. As you ascend the winding staircase to the upper floors, you\'re rewarded with panoramic views of the bustling old city. The surrounding Laad Bazaar, famous for its bangles and traditional crafts, adds to the vibrant atmosphere that makes Charminar one of India\'s most photographed landmarks.',
    coords: { lat: 17.3616, lng: 78.4747 }
  },
  {
    name: 'Mysore Palace',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://wallpaperaccess.com/full/5515777.jpg',
    description: 'The magnificent Mysore Palace, also known as Amba Vilas Palace, is a stunning example of Indo-Saracenic architecture that served as the official residence of the Wadiyar dynasty. This grand palace features a blend of Hindu, Muslim, Rajput, and Gothic architectural styles, with its golden domes and intricately carved doors creating a fairy-tale appearance. The palace comes alive during the Dasara festival when it\'s illuminated with thousands of lights. Inside, the opulent durbar hall, stained glass windows, and priceless artifacts offer a glimpse into the regal heritage of the Kingdom of Mysore.',
    coords: { lat: 12.3052, lng: 76.6552 }
  },
  {
    name: 'Murudeshwar',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://www.holidify.com/images/bgImages/MURUDESHWAR.jpg',
    description: 'Murudeshwar is home to one of the tallest Shiva statues in the world, standing majestically against the backdrop of the Arabian Sea. The temple complex features stunning Kalinga architecture with intricate carvings and a breathtaking 20-story gopuram. The golden spire of the temple reflects beautifully in the waters of the sea, creating a mesmerizing sight. Visitors can climb the 200 steps to reach the temple for panoramic views of the coastline, or relax on the pristine beach that stretches for miles.',
    coords: { lat: 14.0943, lng: 74.4845 }
  },
  {
    name: 'Ooty',
    location: 'Tamil Nadu',
    duration: '3D / 2N',
    image: 'https://res.cloudinary.com/voyehomes/image/upload/v1657619197/Blogs/ooty/rose_lcgkdk.jpg',
    description: 'Known as the "Queen of Hill Stations," Ooty (Udhagamandalam) is nestled in the Nilgiri Hills at an altitude of 2,240 meters. The town is famous for its rolling hills covered with tea plantations, eucalyptus forests, and vibrant flower gardens. The serene Ooty Lake, the scenic Nilgiri Mountain Railway (a UNESCO World Heritage Site), and the Government Botanical Gardens are major attractions. The cool climate, misty mornings, and colonial-era architecture create a charming atmosphere that has captivated visitors for generations.',
    coords: { lat: 11.4102, lng: 76.6950 }
  },
  {
    name: 'Yercaud',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://mangocalltaxi.com/wp-content/uploads/2023/12/yercaud-930x620.webp',
    description: 'Perched at 1,515 meters in the Servarayan Hills of the Eastern Ghats, Yercaud is a tranquil hill station known as the "Lake of Forests." The centerpiece is the beautiful Emerald Lake, surrounded by lush orange groves and spice plantations. The hill station is famous for its coffee plantations, orange orchards, and the unique "Kottagiri" (hill of hills) landscape. The Shevaroyan Temple, Pagoda Point, and the aromatic spice gardens offer visitors a perfect blend of natural beauty and cultural heritage.',
    coords: { lat: 11.7753, lng: 78.2097 }
  },
  {
    name: 'Coonoor',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnyzG-eRev9CXiEi3PdDe3CWaZ6SSSGlTtrKtmBK9D-T0nX_4sizpHZc6D1U-KQZH5a6Y&usqp=CAU',
    description: 'Coonoor, the second-largest hill station in the Nilgiris, offers a more peaceful alternative to bustling Ooty. Nestled at 1,850 meters, this charming town is surrounded by tea estates, eucalyptus forests, and cascading waterfalls. The famous Sim\'s Park with its terraced gardens and the Dolphin\'s Nose viewpoint offering breathtaking valley views are major attractions. Coonoor is also known for its tea auctions and the historic Lawrence School, adding to its colonial charm and serene atmosphere.',
    coords: { lat: 11.3530, lng: 76.7959 }
  },
  {
    name: 'Chikmagalur',
    location: 'Karnataka',
    duration: '3D / 2N',
    image: 'https://res.cloudinary.com/dyiffrkzh/image/upload/c_fill,f_auto,fl_progressive.strip_profile,g_center,h_400,q_auto,w_700/v1723813541/banbanjara/dsbeqpmioly0dufidkvb.webp',
    description: '',
    coords: { lat: 13.3153, lng: 75.7754 }
  },
  {
    name: 'Horsley Hills',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiIuL0mhkibUM45BkO2wYHpoHGB1wvsBP0lEXN85s2xVjttLnXGnJzKWrp-odnllVfQW1bVVA0Sk0x93hyphenhyphenO4a3GT_3O3Ekv8dzsmgACQimG1eZorp85fxOZA58a5TBdh1lIa3X07Ix5r0Xc/',
    description: '',
    coords: { lat: 13.6594, lng: 78.4070 }
  },
  {
    name: 'Lambasingi',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoh2Uo8a6WatotdACiMbv7GVsM8VeyNagawg&s',
    description: '',
    coords: { lat: 17.9833, lng: 82.6667 }
  },
  {
    name: 'Kodaikanal',
    location: 'Tamil Nadu',
    duration: '3D / 2N',
    image: 'https://1.bp.blogspot.com/-LMFUp83_LHk/T9b3uHBwB8I/AAAAAAAABZQ/5c1Nqo4Ix1E/s1600/Kodaikanal_Tourism+01.jpg',
    description: '',
    coords: { lat: 10.2381, lng: 77.4892 }
  },
  {
    name: 'Munnar',
    location: 'Kerala',
    duration: '3D / 2N',
    image: 'https://tse4.mm.bing.net/th/id/OIP._7CACN4ODs7EPPBdb0DA_wHaEK?pid=Api&P=0&h=220',
    description: '',
    coords: { lat: 10.0889, lng: 77.0595 }
  },
  {
    name: 'Alleppey Backwaters',
    location: 'Kerala',
    duration: '3D / 2N',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/cc/95/14/alleppey-backwater-tour.jpg?w=1200&h=900&s=1',
    description: '',
    coords: { lat: 9.4981, lng: 76.3388 }
  },
  {
    name: 'Kumarakom',
    location: 'Kerala',
    duration: '2D / 1N',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Kumarkom.jpg',
    description: '',
    coords: { lat: 9.6167, lng: 76.4333 }
  },
  {
    name: 'Ashtamudi Lake',
    location: 'Kollam, Kerala',
    duration: '2D / 1N',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ashtamudi_lake.jpg',
    description: '',
    coords: { lat: 8.9390, lng: 76.5437 }
  },
  {
    name: 'Poovar Backwaters',
    location: 'Thiruvananthapuram, Kerala',
    duration: '2D / 1N',
    image: 'https://www.poovarbackwatercruise.com/assets/slider/images/banner_1.jpg',
    description: '',
    coords: { lat: 8.3226, lng: 77.0504 }
  },
  {
    name: 'Wayanad',
    location: 'Kerala',
    duration: '3D / 2N',
    image: 'https://www.wayanad.com/files/slides/2064569462.jpg',
    description: '',
    coords: { lat: 11.6854, lng: 76.1320 }
  },
  {
    name: 'Coorg',
    location: 'Karnataka',
    duration: '3D / 2N',
    image: 'https://tse3.mm.bing.net/th/id/OIP.ChLtVZWDJzaz9GUXHtQhmQHaEK?pid=Api&P=0&h=220',
    description: '',
    coords: { lat: 12.4244, lng: 75.7382 }
  },
  {
    name: 'Kanyakumari',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://tse3.mm.bing.net/th/id/OIP.bybdbFLeV3aFNuyt7pkcOAHaEK?pid=Api&P=0&h=220',
    description: '',
    coords: { lat: 8.0883, lng: 77.5385 }
  },
  {
    name: 'Kochi',
    location: 'Kerala',
    duration: '2D / 1N',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/de/f0/eb/backwater-tourism.jpg?w=700&h=-1&s=1',
    description: '',
    coords: { lat: 9.9312, lng: 76.2673 }
  },
  {
    name: 'Thekkady',
    location: 'Kerala',
    duration: '2D / 1N',
    image: 'https://www.soil2soulexpeditions.com/admin/public/images/cities/image_file/48334/Thekkady.jpg',
    description: '',
    coords: { lat: 9.6031, lng: 77.1615 }
  },
  {
    name: 'Bhuvanagiri Fort',
    location: 'Telangana',
    duration: '2D / 1N',
    image: 'https://media.assettype.com/outlooktraveller%2F2024-08-17%2Fny2v7uto%2F2020031977.jpg?w=640&auto=format%2Ccompress',
    description: '',
    coords: { lat: 17.5151, lng: 78.8850 }
  },
  {
    name: 'Warangal',
    location: 'Telangana',
    duration: '2D / 1N',
    image: 'https://tourism.telangana.gov.in/storage/app/media/WARANGAL-IMAGE.jpg',
    description: '',
    coords: { lat: 17.9689, lng: 79.5941 }
  },
  {
    name: 'Araku Valley',
    location: 'Andhra Pradesh',
    duration: '3D / 2N',
    image: 'https://luxoticholidays.com/blog/wp-content/uploads/2025/02/visakhapatnam-araku-valley.jpg',
    description: '',
    coords: { lat: 18.3270, lng: 82.8795 }
  },
  {
    name: 'Pulicat Lake',
    location: 'Andhra Pradesh',
    duration: '2D / 1N',
    image: 'https://hblimg.mmtcdn.com/content/hubble/img/ttd_images/mmt/activities/m_Nellore_Pulicat_lake-1_l_427_640.jpg',
    description: '',
    coords: { lat: 13.4269, lng: 80.3189 }
  },
  {
    name: 'Udupi',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://karnatakatourism.org/_next/image/?url=https%3A%2F%2Fweb-cms.karnatakatourism.org%2Fwp-content%2Fuploads%2F2025%2F06%2Fdji_0053.webp&w=3840&q=75',
    description: '',
    coords: { lat: 13.3409, lng: 74.7421 }
  },
  {
    name: 'Nandi Hills',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://www.holidify.com/images/cmsuploads/compressed/Nandi-One-Trail-Nandi-One-Trek-Indiahikes-e1478063555995_20200412091530.jpg',
    description: '',
    coords: { lat: 13.3702, lng: 77.6835 }
  },
  {
    name: 'Hogenakkal Falls',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Hogenakkal_Falls_Close.jpg/250px-Hogenakkal_Falls_Close.jpg',
    description: '',
    coords: { lat: 12.1176, lng: 77.7752 }
  },
  {
    name: 'Pollachi',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://tse4.mm.bing.net/th/id/OIP.5PR8IhLcvjZck_b848k3jwHaE8?pid=Api&h=220&P=0',
    description: '',
    coords: { lat: 10.6583, lng: 77.0087 }
  },
  {
    name: 'Dhanushkodi',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://tse1.mm.bing.net/th/id/OIP.cw1pl0ZEwPpfIFxjDSZk4AHaFj?pid=Api&h=220&P=0',
    description: '',
    coords: { lat: 9.1748, lng: 79.4322 }
  },
  {
    name: 'Courtallam',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Courtallam_Main_Falls.JPG/1280px-Courtallam_Main_Falls.JPG',
    description: '',
    coords: { lat: 8.9342, lng: 77.2731 }
  },
  {
    name: 'Pathanamthitta',
    location: 'Kerala',
    duration: '2D / 1N',
    image: 'https://keralatravels.com/userfiles/1477897523_nilackal_siva_temple.jpg',
    description: '',
    coords: { lat: 9.2648, lng: 76.7870 }
  },
  {
    name: 'Jog Falls',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Jog_Falls_05092016.jpg/960px-Jog_Falls_05092016.jpg',
    description: '',
    coords: { lat: 14.2294, lng: 74.8087 }
  },
  {
    name: 'Agumbe',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://www.karnataka.com/wp-content/uploads/2010/01/Agumbe-Onake-Abbi-Falls.jpg',
    description: '',
    coords: { lat: 13.6000, lng: 75.1167 }
  },
  {
    name: 'Kemmangundi',
    location: 'Karnataka',
    duration: '2D / 1N',
    image: 'https://www.bynekaadu.com/wp-content/uploads/2024/05/Kemmangundi-Rose-Garden.png',
    description: '',
    coords: { lat: 12.9167, lng: 76.2000 }
  },
  {
    name: 'Valparai',
    location: 'Tamil Nadu',
    duration: '2D / 1N',
    image: 'https://static-blog.treebo.com/wp-content/uploads/2023/11/Valparai_07.jpg',
    description: '',
    coords: { lat: 10.3167, lng: 76.9833 }
  },
  {
    name: 'Ponmudi',
    location: 'Kerala',
    duration: '2D / 1N',
    image: 'https://www.theindiatourism.com/images/Ponmudi.jpg',
    description: '',
    coords: { lat: 8.6167, lng: 77.1333 }
  }
];

export const FALLBACK_DESTINATIONS: Destination[] = destinationSeeds.map((destination, index) => ({
  id: index + 1,
  ...destination
}));

