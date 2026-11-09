// Données de la veille. Pour ajouter un relevé : ajouter un objet dans `entries`
// avec le bon `topic`, une date ISO et au moins une source. Le site range tout seul
// chaque annonce dans sa période (semaine, quinzaine ou trimestre).

window.VEILLE = {
  start: "2025-11-20",

  topics: [
    {
      id: "streaming",
      number: "01",
      title: "Real-time data streaming",
      cadence: "week",
      cadenceLabel: "1 fois par semaine",
      periodLabel: "Semaine",
      intro:
        "Kafka, Flink, Pulsar, Fluss et les plateformes autour : les versions, les rachats et les nouvelles architectures du temps réel.",
    },
    {
      id: "ia",
      number: "02",
      title: "IA générative dans le dev",
      cadence: "fortnight",
      cadenceLabel: "1 fois toutes les 2 semaines",
      periodLabel: "Quinzaine",
      intro:
        "Modèles, agents de code et outils pour les développeurs : ce qui change concrètement dans la façon d'écrire du logiciel.",
    },
    {
      id: "quantique",
      number: "03",
      title: "Ordinateur quantique",
      cadence: "quarter",
      cadenceLabel: "1 fois tous les 3 mois",
      periodLabel: "Trimestre",
      intro:
        "Correction d'erreurs, matériel, industrie et cryptographie post-quantique : les étapes vers une machine utile.",
    },
  ],

  entries: [
    // ------------------------------------------------------------------
    // 01 — Real-time data streaming
    // ------------------------------------------------------------------
    {
      topic: "streaming",
      date: "2025-12-04",
      title: "Apache Flink 2.2.0 se tourne vers l'IA",
      summary:
        "Nouvelle version majeure de la branche 2.x : fonction ML_PREDICT pour appeler un LLM depuis Flink SQL, VECTOR_SEARCH pour la recherche vectorielle en temps réel, et progrès sur les materialized tables, les connecteurs et PyFlink.",
      takeaway: "Le traitement de flux devient un endroit où l'on appelle directement des modèles.",
      tags: ["Flink", "SQL", "IA"],
      sources: [
        { label: "flink.apache.org", url: "https://flink.apache.org/2025/12/04/apache-flink-2.2.0-advancing-real-time-data--ai-and-empowering-stream-processing-for-the-ai-era/" },
      ],
    },
    {
      topic: "streaming",
      date: "2025-12-08",
      title: "IBM annonce le rachat de Confluent pour 11 milliards de dollars",
      summary:
        "IBM veut racheter Confluent, l'éditeur fondé par les créateurs de Kafka, à 31 $ par action. Objectif affiché : alimenter ses offres d'IA d'entreprise avec des données en temps réel.",
      takeaway: "Le plus gros acteur commercial de Kafka change de main.",
      tags: ["Confluent", "IBM", "Marché"],
      sources: [
        { label: "TechCrunch", url: "https://techcrunch.com/2025/12/08/ibm-to-acquire-confluent-for-11b-as-it-seeks-to-bolster-its-data-offerings" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-02-17",
      title: "Kafka 4.2 : les files d'attente (share groups) passent en production",
      summary:
        "Les share groups (KIP-932) permettent à plusieurs consommateurs de se partager les messages d'une même partition, comme une file d'attente classique. Le nouveau protocole de rééquilibrage de Kafka Streams (KIP-1071), géré par le broker, est aussi déclaré prêt pour la production.",
      takeaway: "Kafka peut remplacer RabbitMQ pour les traitements message par message. Viser 4.2.1 ou plus : des bugs de la 4.2.0 y sont corrigés.",
      tags: ["Kafka", "Queues", "Kafka Streams"],
      sources: [
        { label: "kafka.apache.org", url: "https://kafka.apache.org/blog/2026/02/17/apache-kafka-4.2.0-release-announcement/" },
        { label: "Guide de mise à jour 4.2", url: "https://kafka.apache.org/42/getting-started/upgrade/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-02-21",
      title: "Kafka 3.9.2, correctif de la dernière branche avec ZooKeeper",
      summary:
        "Version de correctifs et de sécurité pour la branche 3.9, la dernière à accepter ZooKeeper. Elle inclut KIP-1252 sur le comportement des politiques entre ZooKeeper et KRaft.",
      takeaway: "Les clusters encore sous ZooKeeper doivent préparer leur passage à KRaft.",
      tags: ["Kafka", "KRaft"],
      sources: [
        { label: "kafka.apache.org", url: "https://kafka.apache.org/blog/2026/02/21/apache-kafka-3.9.2-release-announcement/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-02-23",
      title: "Databricks Zerobus Ingest disponible pour tous",
      summary:
        "Service serverless qui écrit des événements directement dans des tables Delta, par gRPC ou REST, sans passer par un bus de messages comme Kafka. Disponible sur AWS et Azure.",
      takeaway: "Pour un flux qui n'a qu'une seule destination (le lakehouse), Kafka n'est plus forcément nécessaire.",
      tags: ["Databricks", "Ingestion", "Lakehouse"],
      sources: [
        { label: "Databricks", url: "https://www.databricks.com/en/blog/announcing-general-availability-zerobus-ingest-part-lakeflow-connect" },
        { label: "SiliconANGLE", url: "https://siliconangle.com/2026/02/23/databricks-streaming-data-ingestion-service-now-available/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-03-02",
      title: "Kafka accepte le principe des topics « diskless » (KIP-1150)",
      summary:
        "Le vote est passé avec 9 voix contraignantes : les topics pourront à terme écrire directement dans un stockage objet (S3) au lieu des disques des brokers. Il s'agit d'une orientation : les KIP de mise en œuvre (1163 et 1164) restent à voter.",
      takeaway: "À terme, beaucoup moins de coûts de réplication entre zones dans le cloud. Pas encore dans une version publiée.",
      tags: ["Kafka", "Stockage objet", "KIP"],
      sources: [
        { label: "Aiven", url: "https://aiven.io/blog/kip-1150-accepted-and-the-road-ahead" },
        { label: "KIP-1150", url: "https://cwiki.apache.org/confluence/display/KAFKA/KIP-1150:+Diskless+Topics" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-03-02",
      title: "Apache Fluss 0.9 : du stockage de flux pensé pour le lakehouse",
      summary:
        "Deuxième version de Fluss dans l'incubateur Apache. Le projet, venu d'Alibaba, propose un stockage de flux en colonnes qui se synchronise avec le lakehouse, conçu pour fonctionner avec Flink.",
      takeaway: "Un concurrent sérieux à Kafka pour les usages analytiques.",
      tags: ["Fluss", "Flink", "Lakehouse"],
      sources: [
        { label: "Incubateur Apache", url: "https://incubator.apache.org/projects/fluss.html" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-03-17",
      title: "IBM finalise le rachat de Confluent",
      summary:
        "La transaction est close, Confluent quitte le Nasdaq. Premières intégrations avec watsonx.data, IBM MQ, webMethods et IBM Z. Jay Kreps rejoint IBM Software.",
      takeaway: "Suivre l'effet sur les prix de Confluent Cloud et sur l'investissement dans Kafka open source.",
      tags: ["Confluent", "IBM", "Marché"],
      sources: [
        { label: "IBM Newsroom", url: "https://newsroom.ibm.com/2026-03-17-ibm-completes-acquisition-of-confluent,-making-real-time-data-the-engine-of-enterprise-ai-and-agents" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-03-30",
      title: "Flink CDC 3.6.0",
      summary:
        "Nouvelle version de Flink CDC, l'outil qui capture les modifications d'une base de données (MySQL, PostgreSQL…) et les transforme en flux d'événements.",
      takeaway: "La capture de changements en base reste le point d'entrée le plus courant du temps réel.",
      tags: ["Flink", "CDC"],
      sources: [
        { label: "flink.apache.org", url: "https://flink.apache.org/2026/03/30/apache-flink-cdc-3.6.0-release-announcement/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-03-31",
      title: "Redpanda Streaming 26.1",
      summary:
        "Redpanda, compatible avec l'API Kafka et écrit en C++, sort une version présentée comme un moteur de streaming « adaptable », capable de changer de compromis entre latence et coût selon les topics.",
      takeaway: "La concurrence sur le protocole Kafka se joue maintenant sur le coût du stockage.",
      tags: ["Redpanda", "API Kafka"],
      sources: [
        { label: "Redpanda", url: "https://www.redpanda.com/press/redpanda-streaming-26-1-introduces-industrys-first-adaptable-streaming-engine" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-04-01",
      title: "Apache Pulsar 4.2.0",
      summary:
        "Nouvelle version de fonctionnalités : réglages de mémoire tampon réseau (PIP-434) et nouvelles politiques de livraison différée des messages (PIP-437). Pulsar 5, avec des « Scalable Topics », est en préparation.",
      takeaway: "Pulsar continue d'avancer, mais l'écosystème se concentre sur le protocole Kafka.",
      tags: ["Pulsar"],
      sources: [
        { label: "pulsar.apache.org", url: "https://pulsar.apache.org/release-notes/versioned/pulsar-4.2.0" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-04-07",
      title: "StreamNative lance Lakestream et un service Kafka natif",
      summary:
        "StreamNative (Pulsar) présente l'architecture Lakestream et Ursa for Kafka, un fork de Kafka 4.2 qui écrit directement au format du lakehouse. En préversion publique limitée sur AWS et GCP.",
      takeaway: "Même les acteurs de Pulsar adoptent le protocole Kafka.",
      tags: ["StreamNative", "Kafka", "Lakehouse"],
      sources: [
        { label: "Business Wire", url: "https://www.businesswire.com/news/home/20260407143701/en/StreamNative-Introduces-Lakestream-Architecture-and-Launches-Native-Kafka-Service-Unifying-Streaming-and-the-Lakehouse" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-05-15",
      title: "Série de correctifs Flink (2.0.2, 2.1.2, 2.2.1)",
      summary:
        "Trois versions de correctifs publiées entre le 11 et le 15 mai, une par branche encore maintenue.",
      takeaway: "Rester sur la dernière version de correctifs de sa branche.",
      tags: ["Flink", "Correctifs"],
      sources: [
        { label: "Flink 2.2.1", url: "https://flink.apache.org/2026/05/15/apache-flink-2.2.1-release-announcement/" },
        { label: "Flink 2.1.2", url: "https://flink.apache.org/2026/05/11/apache-flink-2.1.2-release-announcement/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-05-19",
      title: "Current London : Confluent ouvre Kafka aux agents IA",
      summary:
        "Serveur MCP managé pour Confluent Cloud, disponible pour tous : un agent IA peut manipuler topics, connecteurs et Schema Registry. Confluent publie aussi des « Agent Skills » pour les agents de code, et Flink SQL devient disponible dans Confluent Platform 8.2.",
      takeaway: "Le streaming devient une source de contexte pour les agents IA.",
      tags: ["Confluent", "MCP", "Agents"],
      sources: [
        { label: "Confluent", url: "https://www.confluent.io/blog/2026-q2-confluent-cloud-launch/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-05-22",
      title: "Apache Kafka 4.3.0",
      summary:
        "Nouvelle version mineure avec des fonctionnalités sur le broker, Kafka Streams et Kafka Connect. La 4.3.1 du 25 juin corrige une fuite de mémoire native RocksDB dans Kafka Streams.",
      takeaway: "Qui utilise Kafka Streams avec état doit passer directement en 4.3.1.",
      tags: ["Kafka", "Kafka Streams"],
      sources: [
        { label: "Kafka 4.3.0", url: "https://kafka.apache.org/blog/2026/05/22/apache-kafka-4.3.0-release-announcement/" },
        { label: "Kafka 4.3.1", url: "https://kafka.apache.org/blog/2026/06/25/apache-kafka-4.3.1-release-announcement/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-06-25",
      title: "Apache Flink 2.3.0",
      summary:
        "15 FLIP intégrées : opérateurs de conversion de changelog en SQL, SinkUpsertMaterializer réécrit (bien plus rapide sur certaines requêtes), système de fichiers S3 natif, et checkpoints pendant la reprise après panne (expérimental).",
      takeaway: "Le Flink SQL avec upsert gagne beaucoup en performance.",
      tags: ["Flink", "SQL"],
      sources: [
        { label: "flink.apache.org", url: "https://flink.apache.org/2026/06/25/apache-flink-2.3.0-release-announcement/" },
        { label: "AWS (Managed Flink 2.3)", url: "https://aws.amazon.com/about-aws/whats-new/2026/07/amazon-managed-service-flink-2-3/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-07-16",
      title: "Apache Fluss devient un projet de premier niveau",
      summary:
        "Le conseil de la fondation Apache a voté la sortie de Fluss de l'incubateur. L'annonce publique a suivi début août.",
      takeaway: "Un projet de streaming désormais mature selon les critères Apache.",
      tags: ["Fluss", "Apache"],
      sources: [
        { label: "Incubateur Apache", url: "https://incubator.apache.org/projects/fluss.html" },
        { label: "Blog Fluss", url: "https://fluss.incubator.apache.org/blog/apache-fluss-graduates-to-top-level-project/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-07-29",
      title: "Redpanda SQL arrive sur Google Cloud",
      summary:
        "Redpanda propose une base SQL au-dessus de ses flux, présentée comme une couche de gouvernance pour les agents IA, désormais disponible sur Google Cloud.",
      takeaway: "Les éditeurs de streaming ajoutent une couche de requête pour se rapprocher des bases de données.",
      tags: ["Redpanda", "SQL", "Agents"],
      sources: [
        { label: "Redpanda", url: "https://www.redpanda.com/categories/announcement" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-09-15",
      title: "Naissance du groupe de travail Streamhouse",
      summary:
        "Aiven, Confluent, Redpanda, StreamNative et Ververica s'associent pour définir un standard neutre de « streamhouse » : un flux et une table lakehouse qui ne font qu'un.",
      takeaway: "Des concurrents s'accordent sur une architecture commune, c'est le signal à retenir.",
      tags: ["Streamhouse", "Standard"],
      sources: [
        { label: "Confluent", url: "https://www.confluent.io/blog/aiven-confluent-redpanda-streamnative-and-ververica-form-streamhouse-working-group/" },
        { label: "Aiven", url: "https://aiven.io/press/aiven-others-form-streamhouse-working-group" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-09-29",
      title: "Kafka 4.2.2",
      summary:
        "Dernière version de correctifs de la branche 4.2, celle qui a introduit les share groups en production.",
      takeaway: "La 4.2.2 est la version de la branche 4.2 à viser pour un usage stable.",
      tags: ["Kafka", "Correctifs"],
      sources: [
        { label: "kafka.apache.org", url: "https://kafka.apache.org/blog/2026/09/29/apache-kafka-4.2.2-release-announcement/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-10-10",
      title: "Flink CDC 3.7.0 ajoute des fonctions IA aux pipelines",
      summary:
        "API de modèles interchangeables et fonctions IA intégrées pour enrichir les données capturées pendant leur transfert. Nouvelle source SQL Server et moins de mémoire consommée par le coordinateur.",
      takeaway: "On peut classer ou résumer une ligne modifiée en base avant même qu'elle arrive à destination.",
      tags: ["Flink", "CDC", "IA"],
      sources: [
        { label: "flink.apache.org", url: "https://flink.apache.org/2026/10/10/apache-flink-cdc-3.7.0-release-announcement/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-10-22",
      title: "Apache Kafka 4.4.0",
      summary:
        "25 KIP et 963 commits depuis la 4.3 : nouveautés sur le broker, Streams et Connect. Le script kafka-broker-api-versions.sh est déprécié et disparaîtra à la prochaine version majeure.",
      takeaway: "Vérifier ses scripts d'exploitation avant la future 5.0.",
      tags: ["Kafka"],
      sources: [
        { label: "kafka.apache.org", url: "https://kafka.apache.org/blog/2026/10/22/apache-kafka-4.4.0-release-announcement/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-10-30",
      title: "Flink Agents 0.4 : des agents IA dans un job Flink",
      summary:
        "Préversion qui ajoute les sous-agents : un agent peut déléguer une tâche à un autre agent du même job ou à un service externe. L'équipe annonce que ce sera la dernière version avant la 1.0.",
      takeaway: "Des agents IA pilotés par des événements, avec la tolérance aux pannes de Flink.",
      tags: ["Flink", "Agents", "IA"],
      sources: [
        { label: "flink.apache.org", url: "https://flink.apache.org/2026/10/30/apache-flink-agents-0.4.0-release-announcement/" },
      ],
    },
    {
      topic: "streaming",
      date: "2026-11-04",
      title: "Current 2026 : Confluent lance Query et Lightning Tables",
      summary:
        "À San Francisco, Confluent (désormais filiale d'IBM) présente son architecture Streamhouse : Query pour interroger l'état courant des flux, et Lightning Tables, disponibles pour tous sur AWS. Tableflow devient aussi disponible sur Google Cloud.",
      takeaway: "On interroge l'état actuel des données directement dans Kafka, sans recopier dans une base.",
      tags: ["Confluent", "Streamhouse", "Tableflow"],
      sources: [
        { label: "Confluent", url: "https://www.confluent.io/press-release/confluent-introduces-its-streamhouse-architecture-to-power-ai-with-real-time-business-context/" },
        { label: "diginomica", url: "https://diginomica.com/confluent-adds-query-its-platform-and-streamhouse-gets-its-missing-piece" },
      ],
    },

    // ------------------------------------------------------------------
    // 02 — IA générative dans le dev
    // ------------------------------------------------------------------
    {
      topic: "ia",
      date: "2025-11-24",
      title: "Claude Opus 4.5",
      summary:
        "Anthropic sort Opus 4.5, présenté comme son meilleur modèle pour le code et les agents, à un prix nettement plus bas que l'Opus précédent.",
      takeaway: "Le modèle haut de gamme devient abordable pour un usage quotidien dans les agents de code.",
      tags: ["Anthropic", "Modèle"],
      sources: [
        { label: "Anthropic", url: "https://www.anthropic.com/news/claude-opus-4-5" },
      ],
    },
    {
      topic: "ia",
      date: "2025-12-01",
      title: "DeepSeek V3.2, modèle ouvert",
      summary:
        "DeepSeek publie V3.2 avec des poids ouverts, centré sur le raisonnement et l'usage d'outils par des agents.",
      takeaway: "Les modèles ouverts restent proches des modèles fermés, pour beaucoup moins cher.",
      tags: ["DeepSeek", "Open weights"],
      sources: [
        { label: "DeepSeek", url: "https://api-docs.deepseek.com/news/news251201" },
      ],
    },
    {
      topic: "ia",
      date: "2025-12-09",
      title: "MCP et AGENTS.md rejoignent la Linux Foundation",
      summary:
        "Création de l'Agentic AI Foundation. Anthropic y confie le Model Context Protocol (MCP), OpenAI le format AGENTS.md et Block l'agent goose.",
      takeaway: "Les standards des agents de code passent sous une gouvernance neutre.",
      tags: ["MCP", "Standard", "Open source"],
      sources: [
        { label: "Linux Foundation", url: "https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation" },
      ],
    },
    {
      topic: "ia",
      date: "2025-12-09",
      title: "Mistral lance Devstral 2 et Mistral Vibe",
      summary:
        "Mistral AI publie Devstral 2, modèle ouvert spécialisé dans le code, et Vibe, un agent de code en ligne de commande.",
      takeaway: "Une option européenne pour les agents de code.",
      tags: ["Mistral", "CLI", "Open weights"],
      sources: [
        { label: "Mistral AI", url: "https://mistral.ai/news/devstral-2-vibe-cli" },
      ],
    },
    {
      topic: "ia",
      date: "2025-12-11",
      title: "OpenAI sort GPT-5.2",
      summary:
        "Nouveau modèle phare d'OpenAI, mis en avant pour les tâches professionnelles longues et le code.",
      takeaway: "Une nouvelle version majeure environ tous les trois mois chez chaque fournisseur.",
      tags: ["OpenAI", "Modèle"],
      sources: [
        { label: "Wikipédia", url: "https://en.wikipedia.org/wiki/GPT-5.2" },
      ],
    },
    {
      topic: "ia",
      date: "2025-12-17",
      title: "Gemini 3 Flash",
      summary:
        "Google décline Gemini 3 en version rapide et bon marché, et en fait le modèle par défaut de ses produits.",
      takeaway: "Les petits modèles rapides suffisent pour une grande partie des tâches de code.",
      tags: ["Google", "Modèle"],
      sources: [
        { label: "Google", url: "https://blog.google/products-and-platforms/products/gemini/gemini-3/" },
      ],
    },
    {
      topic: "ia",
      date: "2026-02-02",
      title: "OpenAI lance l'app Codex",
      summary:
        "Application de bureau pour piloter plusieurs agents de code en parallèle, chacun dans sa copie du dépôt.",
      takeaway: "On passe d'un assistant dans l'éditeur à la supervision de plusieurs agents.",
      tags: ["OpenAI", "Codex", "Agents"],
      sources: [
        { label: "Wikipédia", url: "https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent)" },
      ],
    },
    {
      topic: "ia",
      date: "2026-02-05",
      title: "Le même jour : Claude Opus 4.6 et GPT-5.3-Codex",
      summary:
        "Anthropic et OpenAI sortent tous les deux un modèle orienté agents de code le 5 février : Opus 4.6 d'un côté, GPT-5.3-Codex de l'autre.",
      takeaway: "La concurrence se joue sur les agents de code.",
      tags: ["Anthropic", "OpenAI", "Modèle"],
      sources: [
        { label: "Anthropic", url: "https://www.anthropic.com/news/claude-opus-4-6" },
        { label: "Wikipédia (GPT-5.3-Codex)", url: "https://en.wikipedia.org/wiki/GPT-5.3-Codex" },
      ],
    },
    {
      topic: "ia",
      date: "2026-02-17",
      title: "Claude Sonnet 4.6",
      summary:
        "Le modèle intermédiaire d'Anthropic atteint en code un niveau proche de l'Opus précédent, pour un coût inférieur.",
      takeaway: "Le niveau du modèle haut de gamme de l'an dernier devient celui du modèle standard.",
      tags: ["Anthropic", "Modèle"],
      sources: [
        { label: "Anthropic", url: "https://www.anthropic.com/news/claude-sonnet-4-6" },
      ],
    },
    {
      topic: "ia",
      date: "2026-03-05",
      title: "GPT-5.4",
      summary:
        "Nouvelle version d'OpenAI, proposée dès sa sortie dans Codex.",
      takeaway: "Les modèles arrivent dans les outils de code en même temps que dans le chat.",
      tags: ["OpenAI", "Modèle"],
      sources: [
        { label: "Wikipédia", url: "https://en.wikipedia.org/wiki/GPT-5.4" },
      ],
    },
    {
      topic: "ia",
      date: "2026-04-02",
      title: "Cursor 3 met les agents au centre",
      summary:
        "L'éditeur passe au second plan : Cursor 3 s'organise autour d'agents lancés en parallèle, chacun dans son worktree Git.",
      takeaway: "Les éditeurs se redessinent autour des agents.",
      tags: ["Cursor", "Agents", "IDE"],
      sources: [
        { label: "The New Stack", url: "https://thenewstack.io/ai-coding-tool-stack/" },
      ],
    },
    {
      topic: "ia",
      date: "2026-04-07",
      title: "Claude Mythos Preview et Project Glasswing",
      summary:
        "Anthropic annonce un modèle très avancé en sécurité informatique, réservé à des partenaires qui l'utilisent pour trouver et corriger des failles dans des logiciels critiques. Pas de disponibilité générale prévue.",
      takeaway: "Un modèle jugé trop puissant pour une sortie publique : une première.",
      tags: ["Anthropic", "Sécurité"],
      sources: [
        { label: "Anthropic", url: "https://www.anthropic.com/glasswing" },
      ],
    },
    {
      topic: "ia",
      date: "2026-04-23",
      title: "GPT-5.5",
      summary:
        "OpenAI répond deux semaines après Mythos avec GPT-5.5, mis en avant pour le code agentique, avec un prix d'API en hausse.",
      takeaway: "Les meilleurs modèles coûtent plus cher : il faut choisir le bon modèle selon la tâche.",
      tags: ["OpenAI", "Modèle"],
      sources: [
        { label: "Wikipédia", url: "https://en.wikipedia.org/wiki/GPT-5.5" },
      ],
    },
    {
      topic: "ia",
      date: "2026-05-19",
      title: "Google I/O : Gemini 3.5 Flash et Antigravity 2.0",
      summary:
        "Gemini 3.5 Flash devient le modèle de code par défaut chez Google. Antigravity 2.0 arrive avec une application de bureau pour gérer des agents, un outil en ligne de commande et un SDK.",
      takeaway: "Google a maintenant son propre outil complet d'agents de code.",
      tags: ["Google", "Antigravity", "Agents"],
      sources: [
        { label: "Antigravity", url: "https://antigravity.google/blog/google-io-2026/" },
      ],
    },
    {
      topic: "ia",
      date: "2026-06-09",
      title: "Claude Fable 5, la génération 5 arrive",
      summary:
        "Anthropic rend publique Fable 5, version grand public de la classe de modèles Mythos.",
      takeaway: "Les capacités réservées en avril deviennent accessibles à tous.",
      tags: ["Anthropic", "Modèle"],
      sources: [
        { label: "CNBC", url: "https://www.cnbc.com/2026/06/09/anthropic-mythos-claude-fable-5.html" },
      ],
    },
    {
      topic: "ia",
      date: "2026-07-09",
      title: "Codex fusionne avec ChatGPT sur le bureau",
      summary:
        "OpenAI réunit l'app Codex et l'app de bureau ChatGPT. Fin août, les agents peuvent aussi utiliser les outils exposés par les sites dans le navigateur intégré.",
      takeaway: "L'agent de code devient une fonction de l'assistant généraliste.",
      tags: ["OpenAI", "Codex"],
      sources: [
        { label: "Wikipédia", url: "https://en.wikipedia.org/wiki/Codex_(AI_agent)" },
        { label: "Notes de version", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" },
      ],
    },
    {
      topic: "ia",
      date: "2026-09-01",
      title: "Claude Fable 5.1",
      summary:
        "Mise à jour de Fable sortie avec Mythos 5.1, ce dernier réservé aux utilisateurs validés par un programme de vérification en cybersécurité.",
      takeaway: "Les modèles les plus puissants arrivent avec un accès réservé aux profils vérifiés.",
      tags: ["Anthropic", "Modèle"],
      sources: [
        { label: "Wikipédia", url: "https://en.wikipedia.org/wiki/Claude_(language_model)" },
      ],
    },
    {
      topic: "ia",
      date: "2026-09-22",
      title: "Claude Opus 5.5 et GPT-6 sortent le même jour",
      summary:
        "Anthropic sort Opus 5.5 (contexte d'un million de tokens, environ 40 % moins cher à l'usage qu'Opus 5). OpenAI ajoute GPT-6 Sol et Luna dans Codex, puis GPT-6.1 Sol une semaine plus tard.",
      takeaway: "Les sorties s'accélèrent : choisir un outil qui permet de changer facilement de modèle.",
      tags: ["Anthropic", "OpenAI", "Modèle"],
      sources: [
        { label: "Wikipédia (Claude)", url: "https://en.wikipedia.org/wiki/Claude_(language_model)" },
        { label: "Notes de version OpenAI", url: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" },
      ],
    },
    {
      topic: "ia",
      date: "2026-10-06",
      title: "Enquête Stack Overflow 2026 : l'IA dans le quotidien des développeurs",
      summary:
        "Environ 31 000 réponses. 66 % utilisent un assistant ou un agent de code, seuls 17 % n'utilisent aucun outil d'IA. Claude Code passe devant GitHub Copilot. La confiance reste conditionnelle.",
      takeaway: "On utilise l'IA tous les jours, mais on vérifie toujours ce qu'elle produit.",
      tags: ["Enquête", "Usages"],
      sources: [
        { label: "Stack Overflow", url: "https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/" },
      ],
    },
    {
      topic: "ia",
      date: "2026-10-07",
      title: "Claude Haiku 5.5 complète la famille 5.5",
      summary:
        "Après Opus 5.5 (22 septembre) et Sonnet 5.5 (28 septembre), Anthropic sort Haiku 5.5, son modèle rapide et bon marché.",
      takeaway: "Une gamme complète pour répartir les tâches : planifier avec un gros modèle, exécuter avec un petit.",
      tags: ["Anthropic", "Modèle"],
      sources: [
        { label: "Wikipédia", url: "https://en.wikipedia.org/wiki/Claude_(language_model)" },
      ],
    },
    {
      topic: "ia",
      date: "2026-10-28",
      title: "GitHub Universe : Copilot pilote toute la livraison",
      summary:
        "Copilot projects lance des agents sur plusieurs dépôts en parallèle. Une session démarrée sur mobile se poursuit dans VS Code ou la CLI. Copilot Fusion, qui choisit le modèle selon la tâche, est disponible pour tous.",
      takeaway: "Le travail du développeur glisse vers la revue et le pilotage d'agents.",
      tags: ["GitHub", "Copilot", "Agents"],
      sources: [
        { label: "DEV Community", url: "https://dev.to/paullovelace/github-universe-2026-copilot-is-no-longer-an-autocomplete-it-now-runs-software-delivery-14ln" },
        { label: "Global AI Community", url: "https://globalai.community/blog/github-universe-2026-day-1" },
      ],
    },

    // ------------------------------------------------------------------
    // 03 — Ordinateur quantique
    // ------------------------------------------------------------------
    {
      topic: "quantique",
      date: "2025-12-09",
      title: "QuEra fait le bilan d'une année record",
      summary:
        "QuEra (atomes neutres) présente 2025 comme « l'année de la tolérance aux fautes » : avancées en correction d'erreurs et plus de 230 millions de dollars levés, notamment auprès de Google et SoftBank.",
      takeaway: "Les atomes neutres rattrapent les supraconducteurs dans la course aux qubits logiques.",
      tags: ["QuEra", "Correction d'erreurs"],
      sources: [
        { label: "QuEra", url: "https://www.quera.com/press-releases/quera-computing-marks-record-2025-as-the-year-of-fault-tolerance-and-over-230m-of-new-capital-to-accelerate-industrial-deployment" },
      ],
    },
    {
      topic: "quantique",
      date: "2026-04-14",
      title: "NVIDIA publie Ising, des modèles d'IA pour calibrer les processeurs quantiques",
      summary:
        "Famille de modèles open source qui automatise l'étalonnage des qubits et la correction d'erreurs. Un mois plus tôt, PsiQuantum intégrait CUDA-Q pour simuler de grands circuits jusqu'à 450 fois plus vite que sur CPU.",
      takeaway: "Les GPU et l'IA deviennent des outils indispensables pour faire fonctionner un ordinateur quantique.",
      tags: ["NVIDIA", "PsiQuantum", "IA"],
      sources: [
        { label: "Quantum Computing Report", url: "https://quantumcomputingreport.com/news-archive-2026/" },
      ],
    },
    {
      topic: "quantique",
      date: "2026-05-26",
      title: "Quantinuum dépose son dossier d'introduction en bourse",
      summary:
        "La filiale de Honeywell vise une valorisation de plus de 20 milliards de dollars et maintient son objectif d'une machine tolérante aux fautes, Apollo, pour 2029.",
      takeaway: "Le quantique passe de la recherche financée au marché boursier.",
      tags: ["Quantinuum", "Marché"],
      sources: [
        { label: "The Quantum Insider", url: "https://thequantuminsider.com/2026/05/26/honeywell-backed-quantinuum-files-for-landmark-quantum-ipo" },
      ],
    },
    {
      topic: "quantique",
      date: "2026-06-16",
      title: "L'ANSSI exige la cryptographie post-quantique dès 2027",
      summary:
        "À la conférence France Quantum, l'ANSSI annonce qu'elle ne certifiera plus, à partir de 2027, les produits de sécurité sans cryptographie post-quantique. Elle recommande d'acheter uniquement des produits résistants au quantique d'ici 2030.",
      takeaway: "Pour un développeur en France, c'est l'impact le plus concret : prévoir ML-KEM dans les échanges TLS et les produits.",
      tags: ["ANSSI", "Post-quantique", "Sécurité"],
      sources: [
        { label: "Keeper Security", url: "https://www.keepersecurity.com/blog/2026/07/14/post-quantum-cryptography-anssi-certification/" },
        { label: "Evertrust", url: "https://evertrust.io/blog/france-s-anssi-will-stop-certifying-non-quantum-safe-products-in-2027-here-s-what-that-means/" },
      ],
    },
    {
      topic: "quantique",
      date: "2026-09-08",
      title: "Quantinuum valide son architecture de correction d'erreurs Helix",
      summary:
        "Architecture démontrée sur Helios, son processeur à ions piégés de 98 qubits. Elle combine plusieurs codes correcteurs pour réduire le nombre de qubits physiques nécessaires. Elle servira de base à la future machine Apollo.",
      takeaway: "La correction d'erreurs devient un sujet d'architecture, plus seulement de physique.",
      tags: ["Quantinuum", "Correction d'erreurs"],
      sources: [
        { label: "Quantinuum", url: "https://www.quantinuum.com/blog/quantinuums-fault-tolerance-advantage-turning-quantum-reliability-into-commercial-usefulness" },
        { label: "Quantum Computing Report", url: "https://quantumcomputingreport.com/quantinuum-demonstrates-helix-quantum-error-correction-architecture-on-helios-hardware/" },
      ],
    },
    {
      topic: "quantique",
      date: "2026-11-06",
      title: "IBM installe un Quantum System Two à Chicago",
      summary:
        "Premier ordinateur quantique d'IBM dans l'Illinois, à l'Université de Chicago, équipé de Nighthawk, sa puce la plus puissante. IBM s'est engagé en juin à investir plus de 10 milliards de dollars sur cinq ans. Kookaburra, prévu pour 2026, n'a pas encore été présenté.",
      takeaway: "La feuille de route IBM vers 2029 avance, mais l'étape 2026 reste à confirmer.",
      tags: ["IBM", "Matériel"],
      sources: [
        { label: "UChicago News", url: "https://news.uchicago.edu/story/ibms-most-advanced-quantum-computer-unveiled-uchicagos-hyde-park-labs" },
      ],
    },
  ],
};
