---
title: Questions fréquentes (FAQ)
---

Cette page liste quelques questions fréquemment posées à propos de Apache {{% SIS %}}.
Son contenu est traduit de la [page de FAQ en anglais](../faq.html).

{{< toc >}}

# Géoréférencement    {#referencing}

## Pour bien commencer    {#referencing-intro}

### Comment transformer une coordonnée ?    {#transform-point}

Le code java suivant projète une coordonnée de _World Geodetic System 1984_ (WGS84) vers _WGS 84 / UTM zone 33N_.
Afin de rendre cet exemple un peu plus simple, le code utilise des constantes prédéfinies dans la classe `CommonCRS`.
Mais les applications plus avancées utilisent habituellement des codes EPSG à la place.
Notez que les coordonnées ci-dessous sont en latitude puis longitude.

{{< highlight java >}}
import org.opengis.geometry.DirectPosition;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.CoordinateOperation;
import org.opengis.referencing.operation.TransformException;
import org.opengis.util.FactoryException;
import org.apache.sis.referencing.CRS;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.geometry.DirectPosition2D;

public class MyApp {
    public static void main(String[] args) throws FactoryException, TransformException {
        CoordinateReferenceSystem sourceCRS = CommonCRS.WGS84.geographic();
        CoordinateReferenceSystem targetCRS = CommonCRS.WGS84.universal(40, 14);      // Obtient la zone valide pour 14°E.
        CoordinateOperation operation = CRS.findOperation(sourceCRS, targetCRS, null);

        // Les lignes ci-dessus sont coûteuses et ne devraient être appelées qu’une fois pour un ensemble de points.
        // Dans cet exemple, l’opération que l’on obtient est valide pour la zone géographique allant
        // de 12°E à 18°E (UTM zone 33) et de 0°N à 84°N.

        DirectPosition ptSrc = new DirectPosition2D(40, 14);           // 40°N 14°E
        DirectPosition ptDst = operation.getMathTransform().transform(ptSrc, null);

        System.out.println("Source: " + ptSrc);
        System.out.println("Target: " + ptDst);
    }
}
{{< / highlight >}}

### Quelles projections sont supportées ?    {#operation-methods}

Les formules supportées par Apache {{% SIS %}} (incluant les projections cartographiques, mais pas uniquement)
sont listées sur la page [Coordinate Operation Methods](tables/CoordinateOperationMethods.html).
La quantité de formules de projection est relativement faible,
mais la quantité de _Systèmes de Coordonées projetés_ que l’on peut construire avec est considérable.
Par exemple, avec seulement trois familles de formules (_Mercator Cylindrique_, _Mercator Transverse_ et _Lambert Conforme Conique_),
utilisées avec différents paramètres, on peut couvrir des milliers de projections listées dans la base EPSG.

Afin d’utiliser une formule de projection, il est nécessaire de connaître les paramètres de la projection.
Par soucis de facilité d’utilisation, des milliers de projections avec des paramètres pré-définis ont un identifiant unique.
Une source bien connue de ces définitions est la base de données EPSG, mais il existe d’autres autorités.
Les systèmes de coordonnées prédéfinis dans Apache {{% SIS %}} sont listés à la page
[Coordinate Reference Systems](tables/CoordinateReferenceSystems.html).

### Qu’est ce que le problème d’ordre des axes et comment est il abordé ?    {#axisOrder}

L’ordre des axes est spécifié par l’autorité (typiquement un organisme public) qui défini les Systèmes de Référence des Coordonnées (CRS).
L’ordre dépend du type de {{% CRS %}} et du pays qui définit le {{% CRS %}}.
Dans le cas d’un {{% CRS %}} géographique, l’ordre des axes (_latitude_, _longitude_) est largement répandu chez les géographes et les pilotes depuis des siècles.
Toutefois certains développeurs de logiciels ont tendance à toujours utiliser l’ordre (_x_, _y_) pour tous les {{% CRS %}}.
Ces pratiques différentes ont conduit à des définitions contradictoires d’ordre des axes pour presque tous les {{% CRS %}} de type `GeographicCRS`,
pour certains `ProjectedCRS` de l’hémisphère sud (Afrique de sud, Australie, _etc._) et pour certaines projections polaires entre autre.

Pour chaque {{% CRS %}} identifié par un code EPSG, l’ordre officiel des axes peut être vérifié avec
le registre EPSG à l’adresse [https://epsg.org/](https://epsg.org/)
(à ne pas confondre avec d’autres sites ayant « epsg » dans leur nom
mais qui sont sans aucune relation avec l’organisme en charge des définitions EPSG) :
Cliquez sur le lien _« Retrieve by code »_ et entrez le code numérique.
Cliquez ensuite sur le lien _« View »_ de la partie droite
et cliquez sur le symbole _« + »_ à gauche de _« Axes »_.

Les standards {{% OGC %}} récents stipulent que l’ordre des axes est celui défini par l’autorité.
Les standards {{% OGC %}} plus anciens utilisaient l’ordre des axes (_x_, _y_), ignorant la définition de l’autorité.
Parmi les standards {{% OGC %}} obsolètes qui utilisent un ordre des axes non-conforme,
l’un des plus influent est la version 1 de la spécification _Well Known Text_ (WKT).
Selon ce format très utilisé, les définitions {{% WKT %}} sans éléments `AXIS[…]`
doivent par défaut être dans l’ordre (_longitude_, _latitude_) ou (_x_, _y_).
Dans la version 2 du format {{% WKT %}}, les éléments `AXIS[…]` ne sont plus optionnels
et doivent contenir explicitement le sous-élément `ORDER[…]` pour appuyer l’ordre des axes à appliquer.

Beaucoup de logiciels utilisent toujours l’ancien ordre des axes (_x_, _y_), parfois parce qu’il est plus simple à implémenter.
Mais Apache {{% SIS %}} suit l’ordre des axes _tel que défini par l’autorité_ (à l’exception de la lecture de fichier {{% WKT %}} 1).
Il permet toutefois de changer l’ordre des axes après la création d’un {{% CRS %}}.
Ce changement se fait avec le code suivant :

{{< highlight java >}}
CoordinateReferenceSystem crs = ...;             // CRS obtenu de n’importe quelle façon.
crs = AbstractCRS.castOrCopy(crs).forConvention(AxesConvention.RIGHT_HANDED)
{{< / highlight >}}

## Systèmes de Référence des Coordonnées    {#crs}

### Comment créer une projection de type Transverse Universelle de Mercator (UTM) ?    {#UTM}

Si la zone UTM n’est pas connue, une façon simple est d’utiliser la méthode `universal(…)` sur l’une des constantes de `CommonCRS`.
Cette méthode prend en argument une coordonnées géographique en (_latitude_, _longitude_) et en calcule la zone UTM correspondante.
Voir [le code java ci-dessus](#transform-point).

Si la zone UTM est connue, une solution est d’utiliser la fabrique des autorités « EPSG » ou « AUTO ».
Le code EPSG de certaines projections UTM peut être déterminé comme suit,
où _zone_ est un nombre de 1 à 60 inclusif (sauf spécifié autrement) :

* WGS 84 (northern hemisphère nord): 32600 + _zone_
* WGS 84 (hemisphère sud): 32700 + _zone_
* WGS 72 (hemisphère nord): 32200 + _zone_
* WGS 72 (hemisphère sud): 32300 + _zone_
* NAD 83 (hemisphère nord): 26900 + _zone_ (zone de 1 à 23)
* NAD 27 (hemisphère nord): 26700 + _zone_ (zone de 1 à 22)

Notez que la liste ci-dessus est incomplète. Voir la base EPSG pour d’avantages de définitions UTM
(WGS 72BE, SIRGAS 2000, SIRGAS 1995, SAD 69, ETRS 89, _etc._, la plupart définissent quelques zones).
Une fois que le code EPSG de la projection UTM est déterminé, le {{% CRS %}} peut être obtenu comme dans l’exemple ci-dessous:

{{< highlight java >}}
int code = 32600 + zone;    // Pour l’hémisphère nord WGS84
CoordinateReferenceSystem crs = CRS.forCode("EPSG:" + code);
{{< / highlight >}}

### Comment instancier une projection Google ?    {#google}

La projection Google est une projection de Mercator qui prétend utiliser un référentiel WGS84
mais qui ignore la nature ellipsoïdale de ce référentiel et utilise un forme sphérique des formules à la place.
Depuis la version 6.15 de la base EPSG, la façon privilégiée d’obtenir cette projection est d’utiliser la méthode `CRS.forCode("EPSG:3857")`.
Il faut noter que l’usage de cette projection **n’est pas** recommandé, sauf pour des raisons de compatibilité.

La définition de EPSG:3857 utilise une formule de projection nommée _« Popular Visualisation Pseudo Mercator »_.
La base EPSG propose aussi d’autres projections qui utilisent des formules sphériques.
Ces méthodes ont le mot « (Spherical) » dans leur nom, par exemple _« Mercator (Spherical) »_
(qui diffère de _« Popular Visualisation Pseudo Mercator »_ par l’utilisation d’une sphère de rayon plus approprié).
Ces formules de projections peuvent être utilisées dans les définitions _Well Known Text_ (WKT).

Il est possible d’utiliser une formule sphérique avec une projection qui n’a pas de contrepartie sphérique
en déclarant explicitement les paramètres `"semi_major"` et `"semi_minor"` dans la définition {{% WKT %}}.
Ces paramètres sont généralement déduit du référentiel, mais Apache {{% SIS %}} autorise les déclarations à surcharger ces valeurs.

### Comment puis-je identifier le type de projection d’un CRS ?    {#projectionKind}

Le terme « type de projection » (Mercator, Lambert Conformal, _etc._) est appelé _Operation Method_ dans la terminologie {{% ISO %}} 19111.
Une approche possible est de vérifier la valeur de `OperationMethod.getName()` et de comparer avec les noms {{% OGC %}} et EPSG
listés à la page [Coordinate Operation Methods](tables/CoordinateOperationMethods.html).

### Comment obtenir le code EPSG d’un CRS existant ?    {#lookupEPSG}

La propriété _identifiant_ d’un {{% CRS %}} peut être obtenue par la méthode `getIdentifiers()`
qui retourne une collection de zéro ou un élément.
Si le {{% CRS %}} a été créé à partir d’un _Well Known Text_ (WKT)
et que le {{% WKT %}} se termine avec un élément `AUTHORITY["EPSG", "xxxx"]` ({{% WKT %}} version 1)
ou `ID["EPSG", xxxx]` ({{% WKT %}} version 2,
alors l’identifiant (un code numérique EPSG dans cet exemple) sera le _xxxx_ de cet élément.
Si le {{% CRS %}} a été créé à partir de la base EPSG (par exemple avec l’appelle à `CRS.forCode("EPSG:xxxx")`),
alors l’identifiant est le code _xxxx_ donné à la méthode.
Si le {{% CRS %}} a été créé d’une autre façon, alors la collection retournée par la méthode `getIdentifiers()`
pourra être vide dans le cas où le programme qui a créé le {{% CRS %}} a aussi pris la responsabilité de fournir les identifiants.

Si la collection d’identifiants est vide, la méthode la plus efficace de le corriger est de s’assurer que le {{% WKT %}}
contient un élément `AUTHORITY` ou `ID` (en supposant que le {{% CRS %}} vient d’un {{% WKT %}}).
Si ce n’est pas possible, alors la classe `org.apache.sis.referencing.IdentifiedObjects` contient des méthodes utilitaires qui peuvent aider
Dans l’exemple suivant, l’appel à `lookupEPSG(…)` va parcourir la base EPSG pour un {{% CRS %}} équivalent (en ignorant les métadonnées).
*Attention, cette recherche est sensible à l’ordre des axes.*
La plupart des {{% CRS %}} géographiques de la base EPSG sont déclarés avec l’ordre des axes (_latitude_, _longitude_).
En conséquence, si le {{% CRS %}} possède un ordre des axes (_longitude_, _latitude_), la recherche a toutes les chances de ne pas trouver de résultats.

{{< highlight java >}}
CoordinateReferenceSystem myCRS = ...;
Integer identifier = IdentifiedObjects.lookupEPSG(myCRS);
if (identifier != null) {
    System.out.println("Le code EPSG a été trouvé : " + identifier);
}
{{< / highlight >}}

### Comment obtenir l’URN « urn:ogc:def:crs:… » d’un CRS existant ?    {#lookupURN}

L’{{% OGC %}} définit les URN pour les identifiants de {{% CRS %}}, par exemple `"urn:​ogc:​def:​crs:​epsg:​7.1:​4326"`
avec `"7.1"` comme version de la base EPSG utilisée.
Les URN peuvent ou non être présentes dans la collection d’identifiants retournée par `crs.getIdentifiers()`.
Dans beaucoup de cas (principalement quand le {{% CRS %}} provient d’un _Well Known Text_), seul des identifiants simples comme `"EPSG:​4326"` sont présents.
Une façon simple de construire une URN complète est d’utiliser le code ci-dessous.
Cet exemple peut avoir à parcourir la base EPSG afin de trouver les informations qui n’apparaissent pas explicitement dans `myCRS`.

{{< highlight java >}}
CoordinateReferenceSystem myCRS = ...;
String urn = IdentifiedObjects.lookupURN(myCRS);
{{< / highlight >}}

### Puis-je m’appuyer sur IdentifiedObjects.lookupEPSG(…) comme inverse de CRS.forCode(…) ?   {#lookupReliability}

Pour les {{% CRS %}} créés avec la base EPSG, en général oui.
À noter toutefois que `IdentifiedObjects.getIdentifier(…)` est moins riche et insensible aux détails de la définition du {{% CRS %}}
car il n’interroge pas la base de données EPSG. Il marche uniquement si le {{% CRS %}} déclare explicitement son code
ce qui est le cas des {{% CRS %}} créés à partir de la base EPSG ou lus à partir d’un _Well Known Text_ (WKT) avec un élément `AUTHORITY` ou `ID`.
La méthode `lookupEPSG(…)` à l’inverse est plus robuste contre les erreurs de déclaration de code car elle compare toujours le {{% CRS %}} avec celui de la base.
Elle peut échouer s’il y a une légère différence (par exemple d’arrondie dans les paramètres)
entre le {{% CRS %}} fourni et le {{% CRS %}} trouvé dans la base de données.

### Comment déterminer si deux CRS sont « fonctionnellement » égaux ?  {#equalsIgnoreMetadata}

Deux {{% CRS %}} peuvent ne pas être considérés égaux s’ils sont associés à des métadonnées différentes
(nom, identifiant, domaine d’usage, domaine de validité, remarque), même s’ils représentent mathématiquement le même {{% CRS %}}.
Afin de tester si deux {{% CRS %}} sont fonctionnellement équivalents, utilisez la méthode `Utilities​.equalsIgnoreMetadata(myFirstCRS, mySecondCRS)`.

### Est-ce que les CRS sont utilisables comme clé dans un HashMap ?    {#crsHashCode}

Oui, toutes les classes définies dans les paquets `org.apache.sis.referencing.crs`, `cs` et `datum`
définissent leurs propres méthodes `equals(Object)` et `hashCode()`.
La bibliothèque Apache {{% SIS %}} utilise elle-même les objets {{% CRS %}} dans des `Map` à des fins de cache.

## Transformation de coordonnées   {#transforms}

### Mes coordonnées transformées sont totalement fausses !    {#axisOrderInTransforms}

Ce cas se produit principalement à cause des ordonnées données dans le mauvais ordre.
Les développeurs ont tendance à présumer que l’ordre des  axes est (_x_, _y_) ou (_longitude_, _latitude_)
mais les géographes et pilotes utilisent l’ordre (_latitude_, _longitude_) depuis des siècles
et la base de données EPSG définit les systèmes de coordonnées de cette façon.
Si une transformation de coordonnées semble produire des valeurs complètement fausses,
la première chose à faire est d’afficher les {{% CRS %}} source et cible :

{{< highlight java >}}
System.out.println(sourceCRS);
System.out.println(targetCRS);
{{< / highlight >}}

Une attention particulière doit être portée à l’ordre des éléments `AXIS`.
Dans l’exemple ci-dessous, le {{% CRS %}} stipule clairement l’ordre (_latitude_, _longitude_) :

{{< highlight text >}}
GeodeticCRS["WGS 84",
  Datum["World Geodetic System 1984",
    Ellipsoid["WGS 84", 6378137.0, 298.257223563]],
  CS[ellipsoidal, 2],
    Axis["Geodetic latitude (Lat)", north],
    Axis["Geodetic longitude (Lon)", east],
    Unit["degree", 0.017453292519943295]]
{{< / highlight >}}

Si l’ordre (_longitude_, _latitude_) est voulu, Apache {{% SIS %}} est capable de le forcer comme décrit [ci-dessus](#axisOrder).

### Les ordres des axes sont corrects mais les coordonnées transformées sont encore fausses.  {#projectionName}

Vérifiez que se sont les bonnes projections qui sont utilisées. Certains noms sont déroutants.
Par exemple _« Oblique Mercator »_ et _« Hotine Oblique Mercator »_ (dans l’autorité EPSG) sont deux projections différentes.
Mais _« Oblique Mercator »_ (sans le Hotine) de l’autorité EPSG est aussi appelée _« Hotine Oblique Mercator Azimuth Center »_ par ESRI.
tandis que _« Hotine Oblique Mercator »_ (de l’autorité EPSG) est appelée _« Hotine Oblique Mercator Azimuth Natural Origin »_ par ESRI.

La projection _« Oblique Stereographic »_ (de l’autorité EPSG) est appelée _« Double Stereographic »_ par ESRI.
ESRI définit aussi une projection _« Stereographic »_ qui est en réalité une projection oblique comme la précédente mais avec des formules différentes.

### J’ai juste utilisé le WKT d’une autorité connue et mes coordonnées transformées sont toujours fausses !    {#parameterUnits}

La version 1 de la spécification _Well Known Text_ (WKT) a été interprétée de différentes façons en fonction des implémentations logicielles.
Un problème subtil vient des unités d’angles pour le méridien d’origine et les paramètres de projection.
La spécification {{% WKT %}} 1 stipule clairement : _« Si l’élément `PRIMEM` apparaît dans `GEOGCS`,
alors l’unité des longitudes doit correspondre à celle du système de coordonnées géographiques »_ (traduction libre de {{% OGC %}} 01-009).
Toutefois ESRI et GDAL entres autres utilisent inconditionnellement des degrés décimaux, ignorant cette partie de la spécification {{% WKT %}} 1
(note: cette remarque ne s’applique pas à {{% WKT %}} 2).
Ce problème peut être identifié en inspectant l’extrait de {{% WKT %}} suivant :

{{< highlight text >}}
PROJCS["Lambert II étendu",
  GEOGCS["Nouvelle Triangulation Française", ...,
    PRIMEM["Paris", 2.337229167],
    UNIT["grad", 0.01570796326794897]]
  PROJECTION["Lambert_Conformal_Conic_1SP"],
  PARAMETER["latitude_of_origin", 46.8], ...]
{{< / highlight >}}

Le méridien d’origine de Paris est situé à approximativement 2,597 gradians de Greenwich, ce qui correspond à 2,337 degrés.
À partir de ce fait, on peut voir que le {{% WKT %}} ci-dessus utilise des degrés malgré la déclaration de l’unité `UNIT["grad"]`.
Cette erreur s’applique aussi aux valeurs des paramètres, qui déclarent 46,8° dans l’exemple ci-dessus alors que la valeur officielle est de 52 gradians.
Par défaut, Apache {{% SIS %}} interprète ces valeurs angulaires en gradians quand il lit ce type de {{% WKT %}}, ce qui produit de grandes erreurs.
Afin d’obtenir le résultat attendu, il est possible de :

* Remplacer `UNIT["grad", 0.01570796326794897]` par `UNIT["degree", 0.017453292519943295]`,
  ce qui va assurer que Apache {{% SIS %}}, GDAL et ESRI comprennent ce {{% WKT %}} 1 de la même manière.

* Ou demander explicitement à Apache {{% SIS %}} de lire le {{% WKT %}} en utilisant les conventions ESRI ou GDAL,
  avec l’énumération `Convention.WKT1_COMMON_UNITS` pour la valeur de `WKTFormat` dans le paquet `org.apache.sis.io.wkt`.

Il est à noter que le standard GeoPackage requiert explicitement la conformité avec {{% OGC %}} 01-009
et que le nouveau standard {{% WKT %}} 2 suit aussi l’interprétation de {{% OGC %}} 01-009.
Le comportement par défaut de Apache {{% SIS %}} est cohérent avec ces deux standards.

### J’ai vérifié tous ce qui est ci-dessus et j’ai toujours une erreur d’environ un kilomètre. {#BursaWolf}

Les systèmes de coordonnées (CRS) font une approximation de la forme de la terre avec une ellipsoïde.
Différentes ellipsoïdes (en réalité différents _référentiels_) sont utilisées dans différents pays du monde et à différents moments de l’histoire.
Quand on transforme des coordonnées entre deux {{% CRS %}} utilisant le même référentiel, aucun paramètre Bursa-Wolf n’est requis.
Mais quand la transformation implique un changement de référentiel, le module de géoréférencement à besoin d’informations sur la manière d’effectuer ce changement.

Il y a plusieurs façon de spécifier comment appliquer un changement de référentiel, et la plupart sont seulement approximatives.
La méthode de Bursa-Wolf est l’une d’elle, mais pas la seule. Toutefois elle est une des plus fréquemment utilisées.
Les paramètres Bursa-Wolf peuvent être spécifiés à l’intérieur de l’élément `TOWGS84` de la version 1 du format _Well Known Text_ (WKT),
ou dans l’élément `BOUNDCRS` avec la version 2 du format {{% WKT %}}.
Si le {{% CRS %}} est lu à partir d’une chaine {{% WKT %}}, assurez-vous qu’elle contient l’élément approprié.

### J’obtiens des résultats légèrement différents d’un environnement d’exécution à l’autre.   {#slightDifferences}

Les résultats de transformations de coordonnées quand on lance l’application dans un conteneur web (type JBoss, _etc._)
peuvent avoir quelques mètres de différence avec la transformation exécutée dans un IDE (NetBeans, Eclipse, _etc._).
Les résultats dépendent de la présence de la fabrique EPSG dans le chemin de classes (classpath),
**peu importe comment le {{% CRS %}} a été créé**, parce-que la fabrique EPSG spécifie explicitement l’opération à appliquer pour certaines paires de {{% CRS %}}.
Dans ces cas, l’opération spécifiée par EPSG a priorité par rapport aux paramètres de Bursa-Wolf
(l’element `TOWGS84` de la version 1 du format _Well Known Text_).

Une connexion à la base EPSG peut avoir été établie dans un environnement (typiquement celui JEE)
et pas dans l’autre (typiquement un IDE) car uniquement le premier à un pilote {{% JDBC %}}.
La méthode recommandée pour uniformiser les résultats est d’ajouter dans le second environnement (l’IDE)
le même pilote que celui présent dans le premier environnement (JEE).
Cela devrait être un des suivant : JavaDB (aussi nommé Derby), HSQL ou PostgreSQL.
Assurez vous également que les [paramètres de connexion à la base EPSG](epsg.html) sont les mêmes.

### Puis-je présumer qu’il est toujours possible de transformer un CRS arbitraire vers WGS84 ?    {#toWGS84}

Pour les {{% CRS %}} 2D horizontaux créés avec la base de données EPSG, l’appel à `CRS.findOperation(…)` devrait toujours marcher.
Pour les {{% CRS %}} 3D ayant n’importe quel axe de hauteur autre que la hauteur ellipsoïdale, ou pour les {{% CRS %}} 2D de type `EngineeringCRS`, la méthode peu échouer.
Il reste à noter que dans le cas ou la méthode `CRS.findOperation(…)` ne lève pas d’erreur, l’appel à `MathTransform.transform(…)` peut
produire des valeurs `NaN` or `Infinity`si la coordonnée transformée est éloignée de la zone de validité.

# Métadonnées    {#metadata}

## Implementations sur mesures   {#metadata-implementation}

### Mes metadonnées sont stockées dans une forme de base de données. Implémenter toute les interfaces de GeoAPI est infaisable.    {#metadata-proxy}

Les développeurs n’ont pas besoin d’implémenter directement les interfaces de metadonnées.
Si le système de stockage sous-jacent peut accéder aux metadonnées à partir de leur classes et nom de propriétés
(soit le nom java ou le nom {{% ISO %}}/{{% OGC %}}), alors il est possible d’implémenter un seul moteur pour tous les types de metadonnées
et de laisser la Machine Virtuelle Java implémenter les interfaces GeoAPI à la volée, en utilisant la classe `java.lang.reflect.Proxy`.
Pour plus de détails voir la javadoc de la classe `Proxy`, en gardant à l’esprit que le nom {{% ISO %}}/{{% OGC %}} d’une `java.lang.Class` ou
`java.lang.reflect.Method` peut être obtenu comme suit :

{{< highlight java >}}
UML uml = method.getAnnotation(UML.class);
if (uml != null) {
    String name = uml.identifier();
    // Extraire les métadonnées ici.
}
{{< / highlight >}}

Cette approche est utilisée dans le paquet `org.apache.sis.metadata.sql` pour fournir une implémentation
de toutes les interfaces de metadonnées de GeoAPI à partir d’une base de données SQL.

### Je n’arrive pas à écrire mon implémentation de metadonnée  {#metadata-unknownClass}

Les classes données à un marshaller JAXB doivent contenir des annotations JAXB,
sinon l’exception suivante sera lancée :

{{< highlight text >}}
javax.xml.bind.JAXBException: class MyCustomClass nor any of its super class is known to this context.
{{< / highlight >}}

La solution de contournement la plus simple est de décorer l’implémentation dans une des implémentations
fournies dans le paquet `org.apache.metadata.iso`.
Toutes les implémentations du SDK fournissent des constructeurs de copies peu profondes pour rendre cela plus simple.
Il est uniquement nécéssaire de décorer la classes racine, pas les attributs.
Les valeurs des attributs seront décorées automatiquement au besoin par les adaptateurs JAXB.
