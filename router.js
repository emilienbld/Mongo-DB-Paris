import { Router } from  "express";
import {Balade} from "./model.js";

const router = Router();

router.get('/', (req, rep) => {
    rep.json("Salut");
})

// Route 1: Liste de toutes les balades
router.get('/all', async (req, res) => {
    try {
        const balades = await Balade.find();
        res.json(balades);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des balades.' });
    }
});

// Route 2: Afficher une balade par ID
// Exemple de test avec l'id : 6645b37055f8112cfcdf42c9
router.get('/id/:id', async (req, res) => {
    try {
        const balade = await Balade.findById(req.params.id);
        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }
        res.json(balade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de la balade.' });
    }
});

// Route 3: Recherche par nom_poi ou texte_intro
router.get('/search/:search', async (req, res) => {
    try {
        const search = req.params.search;
        const balades = await Balade.find({
            $or: [
                { nom_poi: new RegExp(search, 'i') },
                { texte_intro: new RegExp(search, 'i') }
            ]
        });
        res.json(balades);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la recherche des balades.' });
    }
});


// Route 4: Balades avec un site internet
router.get('/site-internet', async (req, res) => {
    try {
        const balades = await Balade.find({ url_site: { $ne: null } });
        const count = await Balade.countDocuments({ url_site: { $ne: null } });
        res.json({ count, balades });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des balades.' });
    }
});

// Route 5: Balades avec plus de 5 mots clé
router.get('/mot-cle', async (req, res) => {
    try {
        const balades = await Balade.find({ 'mot_cle.5': { $exists: true } });
        const count = await Balade.countDocuments({ 'mot_cle.5': { $exists: true } });
        res.json({ count, balades });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des balades.' });
    }
});

// Route 6: Balades publiées dans une année
router.get ("/publie/:annee", async function(req, rep){

    const year = req.params.annee;

const reponse = await Balade.find({
    date_saisie: { $regex: year, $options: 'i' }
}).sort({ date_saisie: 1 })

    rep.json(reponse)
});

// Route 7: Compter les balades pour un arrondissement donné
router.get('/arrondissement/:num_arrondissement', async (req, res) => {
    try {
        const numArrondissement = req.params.num_arrondissement;

        if (isNaN(numArrondissement) || numArrondissement.length !== 2) {
            return res.status(400).json({ error: 'Numéro d\'arrondissement invalide.' });
        }

        const regex = new RegExp(numArrondissement + '$');
        const count = await Balade.countDocuments({ code_postal: { $regex: regex } });

        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du comptage des balades.' });
    }
});

// Route 8: Synthèse par arrondissement
router.get('/synthese', async (req, res) => {
    try {
        const result = await Balade.aggregate([
            {
                $group: {
                    _id: { $substr: ["$code_postal", 3, 2] },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de la synthèse par arrondissement.' });
    }
});

// Route 9: Afficher les différentes catégories distinctes de balades
router.get('/categories', async (req, res) => {
    try {
        const categories = await Balade.distinct('categorie');
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories.' });
    }
});

// Route 10: Ajouter une nouvelle balade
router.post('/add', async (req, res) => {
    try {
        const { nom_poi, adresse, categorie, code_postal, parcours, url_image, copyright_image, legende, date_saisie, mot_cle, ville, texte_intro, texte_description, url_site, fichier_image, geo_shape, geo_point_2d } = req.body;

        if (!nom_poi || !adresse || !categorie) {
            return res.status(400).json({ error: 'Les champs nom_poi, adresse, et categorie sont obligatoires.' });
        }

        const nouvelleBalade = new Balade({
            nom_poi,
            adresse,
            categorie,
            code_postal,
            parcours,
            url_image,
            copyright_image,
            legende,
            date_saisie,
            mot_cle,
            ville,
            texte_intro,
            texte_description,
            url_site,
            fichier_image,
            geo_shape,
            geo_point_2d
        });

        await nouvelleBalade.save();
        res.status(201).json(nouvelleBalade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la nouvelle balade.' });
    }
});
// Dans Thunder Client Mettre en POST et dans body mettre par exemple les informations suivantes
// {
//     "nom_poi": "Nouveau POI",
//     "adresse": "123 Rue de Paris",
//     "categorie": "parc",
//     "code_postal": "75001",
//     "parcours": ["balade1"],
//     "url_image": "http://example.com/image.jpg",
//     "copyright_image": "Copyright Example",
//     "legende": "Légende Example",
//     "date_saisie": "2024-05-15",
//     "mot_cle": ["mot1", "mot2"],
//     "ville": "Paris",
//     "texte_intro": "Introduction du POI",
//     "texte_description": "Description détaillée du POI",
//     "url_site": "http://example.com",
//     "fichier_image": {
//         "thumbnail": true,
//         "filename": "example.png",
//         "format": "PNG",
//         "width": 100,
//         "mimetype": "image/png",
//         "etag": "123456",
//         "id": "id_image",
//         "last_synchronized": "2024-05-15T08:49:13.067Z",
//         "color_summary": [],
//         "height": 100
//     },
//     "geo_shape": {
//         "type": "Feature",
//         "geometry": {
//             "coordinates": [2.3522, 48.8566],
//             "type": "Point"
//         },
//         "properties": {}
//     },
//     "geo_point_2d": {
//         "lon": 2.3522,
//         "lat": 48.8566
//     }
// }

// Route 11: Ajouter un mot clé à une balade existante
router.put('/add-mot-cle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mot_cle } = req.body;

        if (!mot_cle) {
            return res.status(400).json({ error: 'Le mot clé est obligatoire.' });
        }

        const balade = await Balade.findById(id);

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        if (balade.mot_cle.includes(mot_cle)) {
            return res.status(400).json({ error: 'Le mot clé existe déjà.' });
        }

        balade.mot_cle.push(mot_cle);
        await balade.save();

        res.status(200).json(balade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout du mot clé.' });
    }
});
// Dans Thunder Client Mettre en PUT et dans body mettre par exemple les informations suivantes
// {
//     "mot_cle": "nouveau_mot_cle"
// }

// Route 12: Mettre à jour une balade via son id
router.put('/update-one/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const miseAJour = req.body;

        const balade = await Balade.findByIdAndUpdate(id, miseAJour, { new: true });

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json(balade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la balade.' });
    }
});
// Dans Thunder Client Mettre en PUT et dans body mettre par exemple les informations suivantes
// {
//     "nom_poi": "Nom mis à jour",
//     "adresse": "Adresse mise à jour",
//     "categorie": "nouvelle_categorie",
//     "code_postal": "75002",
//     "parcours": ["balade2"],
//     "url_image": "http://example.com/nouvelle_image.jpg",
//     "copyright_image": "Nouveau Copyright",
//     "legende": "Nouvelle légende",
//     "date_saisie": "2024-05-16",
//     "mot_cle": ["nouveau_mot1", "nouveau_mot2"],
//     "ville": "Paris",
//     "texte_intro": "Nouvelle introduction",
//     "texte_description": "Nouvelle description",
//     "url_site": "http://example.com/nouveau_site",
//     "fichier_image": {
//         "thumbnail": false,
//         "filename": "nouveau_example.png",
//         "format": "PNG",
//         "width": 200,
//         "mimetype": "image/png",
//         "etag": "789012",
//         "id": "nouveau_id_image",
//         "last_synchronized": "2024-05-16T08:49:13.067Z",
//         "color_summary": ["#FFFFFF"],
//         "height": 200
//     },
//     "geo_shape": {
//         "type": "Feature",
//         "geometry": {
//             "coordinates": [2.3522, 48.8566],
//             "type": "Point"
//         },
//         "properties": {}
//     },
//     "geo_point_2d": {
//         "lon": 2.3522,
//         "lat": 48.8566
//     }
// }

// Route 13: Mettre à jour "nom_poi" de plusieurs balades
router.put('/update-many/:search', async (req, res) => {
    try {
        const { search } = req.params;
        const { nom_poi } = req.body;

        if (!nom_poi) {
            return res.status(400).json({ error: 'Le nom_poi est obligatoire.' });
        }

        const regex = new RegExp(search, 'i'); // Expression régulière insensible à la casse

        const balades = await Balade.updateMany({ texte_description: { $regex: regex } }, { nom_poi });

        if (balades.nModified === 0) {
            return res.status(404).json({ error: 'Aucune balade à mettre à jour.' });
        }

        res.status(200).json({ message: 'Balades mises à jour avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des balades.' });
    }
});
// Dans Thunder Client Mettre en PUT et dans body mettre par exemple les informations suivantes
// {
//     "nom_poi": "Nouveau nom_poi"
// }

// Route 14: Supprimer une balade via son ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const balade = await Balade.findByIdAndDelete(id);

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json({ message: 'Balade supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la balade.' });
    }
});
// Dans Thunder Client Mettre en DELETE





export default router ;