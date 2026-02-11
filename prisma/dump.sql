PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO users VALUES('cmi0d5jbq00006d8vg90tnlxc','Admin User','admin@panico.app',NULL,NULL,'$2b$12$9e5oxbRtljdNMtF2dJCDcurj6fZv1n1jYf4IBqrgP3CPVX3kO71T.','ADMIN','+39 320 1234567',1763215785494,1763215785494);
INSERT INTO users VALUES('cmi0d5jha00016d8v2fkh2wb2','Event Organizer','organizer@panico.app',NULL,NULL,'$2b$12$iuV2wVr.wr6iq8Zp9Mvhy.47yAkI0BLd6EkXJA4O7v1oMBBV9Ptue','ORGANIZER','+39 320 2345678',1763215785694,1763215785694);
INSERT INTO users VALUES('cmi0d5jms00026d8v44rou58m','Marco Rossi','marco.pr@panico.app',NULL,NULL,'$2b$12$P/KoYhyh7A5QD6RxmZfKleRC8dUV/MNB99x8MqgJ9KKjEyz5HdRmW','PR','+39 320 3456789',1763215785893,1763215785893);
INSERT INTO users VALUES('cmi0d5jsc00056d8vifbwd5ib','Sofia Bianchi','sofia.pr@panico.app',NULL,NULL,'$2b$12$0BsXU8HcPAQhTxG2agxMg.IwWLdOsSf60F8JPpQX9MB3AOgNZIpz.','PR','+39 320 4567890',1763215786092,1763215786092);
INSERT INTO users VALUES('cmi0d5jxu00086d8vwdd0hv91','Luca Verdi','luca.pr@panico.app',NULL,NULL,'$2b$12$hlBupq04JDiGJIXfdQf28OzNAmYLYGFRk5VdzAlXTSr/7S14smSU.','PR','+39 320 5678901',1763215786290,1763215786290);
INSERT INTO users VALUES('cmi0d5k3c000b6d8v143n2cfw','Anna Staff','anna.staff@panico.app',NULL,NULL,'$2b$12$6KRjZHpI2Id6tGamQIYccucVn8GjetJRdY/DuNyuK81kafF1Z02fe','STAFF','+39 320 6789012',1763215786489,1763215786489);
INSERT INTO users VALUES('cmi0d5k8u000c6d8vy9zmucpv','Giuseppe Staff','giuseppe.staff@panico.app',NULL,NULL,'$2b$12$WQx3xTLQf9lw562bD/ezJOCFX1eSeK3GM2k0i5h217EM0zX68WsKy','STAFF','+39 320 7890123',1763215786687,1763215786687);
INSERT INTO users VALUES('cmi0d5keb000d6d8v8aw9u57l','User1','user1@example.com',NULL,NULL,'$2b$12$L3Cf50vgNxLbge69QNJ4b.rNlp3lLxqjhIt6qpAqu.XyOTXpNgh.y','USER','+39 320 8900001',1763215786884,1763215786884);
INSERT INTO users VALUES('cmi0d5kjt000e6d8vgsoc0wxl','User2','user2@example.com',NULL,NULL,'$2b$12$X3o5MCycbAyhX7ImNFY.oeIeN25FIk6YHjfaJcowmha/z8.2vudIO','USER','+39 320 8900002',1763215787081,1763215787081);
INSERT INTO users VALUES('cmi0d5kpa000f6d8vkgyh4hpj','User3','user3@example.com',NULL,NULL,'$2b$12$/XkaLptFJfV7UWSftFD4LOp68OAouYWOP5VcMcLjBSFTlhzDHKA0u','USER','+39 320 8900003',1763215787278,1763215787278);
INSERT INTO users VALUES('cmi0d5kus000g6d8vfkm3jqtw','User4','user4@example.com',NULL,NULL,'$2b$12$VIpNZMdr21KEWFUlMHUntuFBjkztARoKiGTjM.iFTYIbDf1mrZEby','USER','+39 320 8900004',1763215787476,1763215787476);
INSERT INTO users VALUES('cmi0d5l09000h6d8vibgb2ymh','User5','user5@example.com',NULL,NULL,'$2b$12$pwj.HhrxnAp0lg3JjBbGB.VvFxVe8E3JQBTckzezH9uUdcHKmxpJK','USER','+39 320 8900005',1763215787673,1763215787673);
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "venues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "capacity" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO venues VALUES('cmi0d5l09000i6d8vcm9x2pts','Club Catania','Via Roma, 123','Catania',500,1763215787674,1763215787674);
INSERT INTO venues VALUES('cmi0d5l0a000j6d8varc7uf31','Lido Siracusa','Lungomare Ortigia, 45','Siracusa',300,1763215787674,1763215787674);
CREATE TABLE IF NOT EXISTS "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "dateStart" DATETIME NOT NULL,
    "dateEnd" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "minAge" INTEGER,
    "dressCode" TEXT,
    "venueId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "events_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "events_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO events VALUES('cmi0d5l0b000l6d8v6qyvwdgn','Notte Bianca Catania','Una notte indimenticabile nel cuore di Catania con i migliori DJ internazionali','https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600',1763820587674,1763842187674,'PUBLISHED',18,'Elegante','cmi0d5l09000i6d8vcm9x2pts','cmi0d5jha00016d8v2fkh2wb2',1763215787676,1763215787676);
INSERT INTO events VALUES('cmi0d5l0c000n6d8vnjsdyelp','Summer Beach Party','Festa in spiaggia con cocktails, musica e divertimento fino all''alba','https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600',1764425387675,1764454187675,'PUBLISHED',21,'Beach Chic','cmi0d5l0a000j6d8varc7uf31','cmi0d5jha00016d8v2fkh2wb2',1763215787676,1763215787676);
INSERT INTO events VALUES('cmi0d5l0c000p6d8v0agw5zlq','Electronic Vibes','La migliore musica elettronica con artisti di fama mondiale','https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600',1765030187675,1765055387675,'PUBLISHED',18,NULL,'cmi0d5l09000i6d8vcm9x2pts','cmi0d5jha00016d8v2fkh2wb2',1763215787677,1763215787677);
INSERT INTO events VALUES('cmi0d5l0d000r6d8vtl8523np','Halloween Party 2024','La festa di Halloween più spettacolare dell''anno','https://images.unsplash.com/photo-1509557965043-6b9f3fdc6c8a?w=800&h=600',1762610987675,1762632587675,'CLOSED',18,NULL,'cmi0d5l09000i6d8vcm9x2pts','cmi0d5jha00016d8v2fkh2wb2',1763215787677,1763215787677);
CREATE TABLE IF NOT EXISTS "pr_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "referralCode" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pr_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO pr_profiles VALUES('cmi0d5jmu00046d8vf4z54z6x','cmi0d5jms00026d8v44rou58m','Marco R.','MARCO2024','+39 320 3456789',1763215785894,1763215785894);
INSERT INTO pr_profiles VALUES('cmi0d5jsd00076d8vogfxqjkz','cmi0d5jsc00056d8vifbwd5ib','Sofia B.','SOFIA2024','+39 320 4567890',1763215786093,1763215786093);
INSERT INTO pr_profiles VALUES('cmi0d5jxv000a6d8vj5qy1snf','cmi0d5jxu00086d8vwdd0hv91','Luca V.','LUCA2024','+39 320 5678901',1763215786292,1763215786292);
CREATE TABLE IF NOT EXISTS "assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "prProfileId" TEXT NOT NULL,
    "quotaTotal" INTEGER,
    "quotaFemale" INTEGER,
    "quotaMale" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "assignments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assignments_prProfileId_fkey" FOREIGN KEY ("prProfileId") REFERENCES "pr_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO assignments VALUES('cmi0d5l0d000t6d8vx9sllaeo','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5jmu00046d8vf4z54z6x',50,25,25,1763215787677,1763215787677);
INSERT INTO assignments VALUES('cmi0d5l0d000v6d8v6w28g69d','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5jsd00076d8vogfxqjkz',40,20,20,1763215787678,1763215787678);
INSERT INTO assignments VALUES('cmi0d5l0e000x6d8v8j7u9ty4','cmi0d5l0c000n6d8vnjsdyelp','cmi0d5jsd00076d8vogfxqjkz',60,35,25,1763215787678,1763215787678);
INSERT INTO assignments VALUES('cmi0d5l0e000z6d8vpmp81vpj','cmi0d5l0c000n6d8vnjsdyelp','cmi0d5jxv000a6d8vj5qy1snf',35,20,15,1763215787679,1763215787679);
CREATE TABLE IF NOT EXISTS "lists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quotaTotal" INTEGER,
    "quotaFemale" INTEGER,
    "quotaMale" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lists_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO lists VALUES('cmi0d5l0e00116d8v0uem8c4m','cmi0d5l0b000l6d8v6qyvwdgn','Lista Marco','PR',50,25,25,1763215787679,1763215787679);
INSERT INTO lists VALUES('cmi0d5l0f00136d8vhqowwm98','cmi0d5l0b000l6d8v6qyvwdgn','Lista Sofia','PR',40,20,20,1763215787679,1763215787679);
INSERT INTO lists VALUES('cmi0d5l0f00156d8vis2xfml4','cmi0d5l0b000l6d8v6qyvwdgn','Lista Invitati VIP','GUEST',20,NULL,NULL,1763215787680,1763215787680);
INSERT INTO lists VALUES('cmi0d5l0g00176d8vmranav85','cmi0d5l0b000l6d8v6qyvwdgn','Lista Staff','STAFF',10,NULL,NULL,1763215787680,1763215787680);
CREATE TABLE IF NOT EXISTS "guests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "nickname" TEXT,
    "birthDate" DATETIME,
    "city" TEXT,
    "occupation" TEXT,
    "instagram" TEXT,
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "lastEventDate" DATETIME,
    "customerSegment" TEXT NOT NULL DEFAULT 'NEW',
    "preferredDays" TEXT,
    "averageArrivalTime" TEXT,
    "prefersTable" BOOLEAN NOT NULL DEFAULT false,
    "averageGroupSize" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
, "telegramChatId" TEXT, "whatsappPhone" TEXT);
CREATE TABLE IF NOT EXISTS "list_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listId" TEXT NOT NULL,
    "guestId" TEXT,
    "addedByUserId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "gender" TEXT NOT NULL DEFAULT 'UNK',
    "note" TEXT,
    "createdVia" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "plusOne" BOOLEAN NOT NULL DEFAULT false,
    "bookingMethod" TEXT NOT NULL DEFAULT 'MANUAL',
    "referralSource" TEXT,
    "groupSize" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "list_entries_listId_fkey" FOREIGN KEY ("listId") REFERENCES "lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_entries_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "list_entries_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO list_entries VALUES('cmi0d5l0g00196d8vuvvm04tj','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Luca','Costa','+39 321 2809763','luca.costa0@libero.it','M',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787681,1763215787681);
INSERT INTO list_entries VALUES('cmi0d5l0h001b6d8v0ohq561o','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Marco','Rizzo','+39 328 7340262','marco.rizzo1@yahoo.it','M',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787681,1763215787681);
INSERT INTO list_entries VALUES('cmi0d5l0h001d6d8v3wyxtxri','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Luca','Costa','+39 326 9562606','luca.costa2@hotmail.it','NB',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787682,1763215787682);
INSERT INTO list_entries VALUES('cmi0d5l0i001f6d8vct6komtb','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Davide','De Luca','+39 321 8725721','davide.de luca3@libero.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787682,1763215787682);
INSERT INTO list_entries VALUES('cmi0d5l0i001h6d8vr4isynxb','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Andrea','Gallo','+39 324 4155448','andrea.gallo4@yahoo.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787683,1763215787683);
INSERT INTO list_entries VALUES('cmi0d5l0i001j6d8vg3227m0f','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Francesco','Verdi','+39 324 3335523','francesco.verdi5@yahoo.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787683,1763215787683);
INSERT INTO list_entries VALUES('cmi0d5l0j001l6d8vz7lp1rua','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Marco','Verdi','+39 321 7861278','marco.verdi6@tiscali.it','M',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787683,1763215787683);
INSERT INTO list_entries VALUES('cmi0d5l0j001n6d8vqq9pgdbb','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Sara','Gallo','+39 321 4625321','sara.gallo7@yahoo.it','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787684,1763215787684);
INSERT INTO list_entries VALUES('cmi0d5l0k001p6d8vfawjjq2p','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Alessandro','Romano','+39 326 2760508','alessandro.romano8@gmail.com','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787684,1763215787684);
INSERT INTO list_entries VALUES('cmi0d5l0k001r6d8vvlro2ikk','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Chiara','Bianchi','+39 326 7671233','chiara.bianchi9@hotmail.it','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787685,1763215787685);
INSERT INTO list_entries VALUES('cmi0d5l0l001t6d8v95mxbxwe','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Alessandro','Conti','+39 320 2440726','alessandro.conti10@libero.it','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787685,1763215787685);
INSERT INTO list_entries VALUES('cmi0d5l0l001v6d8vx56hqjog','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Luca','Bianchi','+39 328 9394705','luca.bianchi11@tiscali.it','NB',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787685,1763215787685);
INSERT INTO list_entries VALUES('cmi0d5l0l001x6d8vywjdc6f1','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Luca','Bruno','+39 321 7531527','luca.bruno12@tiscali.it','M',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787686,1763215787686);
INSERT INTO list_entries VALUES('cmi0d5l0m001z6d8v3eg9slin','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Chiara','Romano','+39 322 2745227','chiara.romano13@tiscali.it','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787686,1763215787686);
INSERT INTO list_entries VALUES('cmi0d5l0m00216d8vtv2uemgr','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Chiara','Costa','+39 322 8627311','chiara.costa14@yahoo.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787686,1763215787686);
INSERT INTO list_entries VALUES('cmi0d5l0m00236d8v6o2x9b6p','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Valentina','Bruno','+39 326 6010789','valentina.bruno15@gmail.com','NB',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787687,1763215787687);
INSERT INTO list_entries VALUES('cmi0d5l0n00256d8v3fhz49fd','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Valentina','Conti','+39 320 6624160','valentina.conti16@hotmail.it','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787687,1763215787687);
INSERT INTO list_entries VALUES('cmi0d5l0n00276d8vx7ru6kas','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Federica','Conti','+39 323 7031703','federica.conti17@yahoo.it','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787688,1763215787688);
INSERT INTO list_entries VALUES('cmi0d5l0n00296d8v4j8mprba','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Luca','Marino','+39 322 7172290','luca.marino18@tiscali.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787688,1763215787688);
INSERT INTO list_entries VALUES('cmi0d5l0o002b6d8v9oeuuqw6','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Federica','Verdi','+39 320 6466941','federica.verdi19@hotmail.it','M',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787688,1763215787688);
INSERT INTO list_entries VALUES('cmi0d5l0o002d6d8vqz282dcp','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Andrea','Greco','+39 323 8909110','andrea.greco20@yahoo.it','M',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787689,1763215787689);
INSERT INTO list_entries VALUES('cmi0d5l0p002f6d8vjjaqptb6','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Lorenzo','Rossi','+39 324 2131105','lorenzo.rossi21@hotmail.it','F',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787689,1763215787689);
INSERT INTO list_entries VALUES('cmi0d5l0p002h6d8vxv4nr8ve','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Francesco','Gallo','+39 323 4240814','francesco.gallo22@yahoo.it','M',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787689,1763215787689);
INSERT INTO list_entries VALUES('cmi0d5l0p002j6d8vyiiuqj2n','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Valentina','Ricci','+39 327 4238598','valentina.ricci23@libero.it','F',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787690,1763215787690);
INSERT INTO list_entries VALUES('cmi0d5l0q002l6d8v95d90qba','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Matteo','Costa','+39 324 4176830','matteo.costa24@yahoo.it','NB',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787690,1763215787690);
INSERT INTO list_entries VALUES('cmi0d5l0q002n6d8vb7gtm481','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Giulia','Neri','+39 320 4473748','giulia.neri25@libero.it','M',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787691,1763215787691);
INSERT INTO list_entries VALUES('cmi0d5l0r002p6d8vpf6haw98','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Sofia','Costa','+39 323 7204519','sofia.costa26@gmail.com','F',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787691,1763215787691);
INSERT INTO list_entries VALUES('cmi0d5l0r002r6d8v1jqldzet','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Francesco','Bruno','+39 320 9004660','francesco.bruno27@libero.it','NB',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787691,1763215787691);
INSERT INTO list_entries VALUES('cmi0d5l0r002t6d8v07zi1xj5','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Alessandro','Bruno','+39 324 5799433','alessandro.bruno28@yahoo.it','M',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787692,1763215787692);
INSERT INTO list_entries VALUES('cmi0d5l0s002v6d8v0evep561','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Martina','Mancini','+39 327 2198653','martina.mancini29@yahoo.it','NB',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787692,1763215787692);
INSERT INTO list_entries VALUES('cmi0d5l0s002x6d8vqkoue0g8','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Federica','Romano','+39 326 4979336','federica.romano30@gmail.com','F',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787693,1763215787693);
INSERT INTO list_entries VALUES('cmi0d5l0s002z6d8vu6mo4vm8','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Marco','Costa','+39 321 7437009','marco.costa31@yahoo.it','NB',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787693,1763215787693);
INSERT INTO list_entries VALUES('cmi0d5l0t00316d8vqck0h9s2','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Matteo','Mancini','+39 326 9884051','matteo.mancini32@libero.it','M',NULL,'MANUAL','PENDING',1,'MANUAL',NULL,1,1763215787693,1763215787693);
INSERT INTO list_entries VALUES('cmi0d5l0t00336d8vnl58bnau','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Chiara','Bruno','+39 320 4064981','chiara.bruno33@gmail.com','M',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787694,1763215787694);
INSERT INTO list_entries VALUES('cmi0d5l0u00356d8v8ye95pgm','cmi0d5l0e00116d8v0uem8c4m',NULL,'cmi0d5jms00026d8v44rou58m','Francesco','Verdi','+39 327 2414064','francesco.verdi34@yahoo.it','F',NULL,'MANUAL','PENDING',1,'MANUAL',NULL,1,1763215787694,1763215787694);
INSERT INTO list_entries VALUES('cmi0d5l0u00376d8v42b9bfl8','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Luca','Bruno','+39 333 7827967','luca.bruno100@gmail.com','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787694,1763215787694);
INSERT INTO list_entries VALUES('cmi0d5l0u00396d8vfz91s7vp','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Giulia','Bruno','+39 337 1372720','giulia.bruno101@gmail.com','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787695,1763215787695);
INSERT INTO list_entries VALUES('cmi0d5l0v003b6d8vawvo0p96','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Valentina','Rizzo','+39 337 1173027','valentina.rizzo102@tiscali.it','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787695,1763215787695);
INSERT INTO list_entries VALUES('cmi0d5l0v003d6d8vr7atd0v4','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Federica','Rossi','+39 337 8423313','federica.rossi103@libero.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787696,1763215787696);
INSERT INTO list_entries VALUES('cmi0d5l0w003f6d8v2vq90tyc','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Alessandro','Bianchi','+39 339 2447777','alessandro.bianchi104@tiscali.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787696,1763215787696);
INSERT INTO list_entries VALUES('cmi0d5l0w003h6d8v5qevrajt','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Sara','Greco','+39 337 3505216','sara.greco105@gmail.com','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787696,1763215787696);
INSERT INTO list_entries VALUES('cmi0d5l0w003j6d8v4vdoflv3','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Chiara','Ricci','+39 335 7178093','chiara.ricci106@tiscali.it','NB',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787697,1763215787697);
INSERT INTO list_entries VALUES('cmi0d5l0x003l6d8vg3av9xwv','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Andrea','Rizzo','+39 333 5325358','andrea.rizzo107@gmail.com','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787697,1763215787697);
INSERT INTO list_entries VALUES('cmi0d5l0x003n6d8vijg5jt2m','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Sofia','Rossi','+39 330 9458073','sofia.rossi108@libero.it','NB',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787698,1763215787698);
INSERT INTO list_entries VALUES('cmi0d5l0x003p6d8v7564kt7b','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Giulia','Mancini','+39 330 1634493','giulia.mancini109@hotmail.it','M',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787698,1763215787698);
INSERT INTO list_entries VALUES('cmi0d5l0y003r6d8vxgzaf3c0','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Sara','Gallo','+39 339 7434225','sara.gallo110@hotmail.it','M',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787698,1763215787698);
INSERT INTO list_entries VALUES('cmi0d5l0y003t6d8vi6imejv6','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Matteo','Bruno','+39 334 7315384','matteo.bruno111@hotmail.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787699,1763215787699);
INSERT INTO list_entries VALUES('cmi0d5l0z003v6d8vnfi3dov4','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Federica','Conti','+39 338 1429857','federica.conti112@yahoo.it','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787699,1763215787699);
INSERT INTO list_entries VALUES('cmi0d5l0z003x6d8vdlrsyhva','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Federica','Bianchi','+39 339 4100069','federica.bianchi113@libero.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787699,1763215787699);
INSERT INTO list_entries VALUES('cmi0d5l0z003z6d8vw2vy9rb8','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Matteo','Verdi','+39 333 5290071','matteo.verdi114@gmail.com','M',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787700,1763215787700);
INSERT INTO list_entries VALUES('cmi0d5l1000416d8v2t06g5ex','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Chiara','Marino','+39 337 3216274','chiara.marino115@yahoo.it','M',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787700,1763215787700);
INSERT INTO list_entries VALUES('cmi0d5l1000436d8vqger5am0','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Valentina','Neri','+39 336 4930684','valentina.neri116@tiscali.it','M',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787701,1763215787701);
INSERT INTO list_entries VALUES('cmi0d5l1000456d8v3f6q1fjl','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Martina','De Luca','+39 338 6911891','martina.de luca117@gmail.com','F',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787701,1763215787701);
INSERT INTO list_entries VALUES('cmi0d5l1100476d8vmhdeuna3','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Elena','Rossi','+39 339 2503068','elena.rossi118@libero.it','NB',NULL,'MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787701,1763215787701);
INSERT INTO list_entries VALUES('cmi0d5l1100496d8vd2rdbr73','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Luca','Romano','+39 335 7928159','luca.romano119@gmail.com','NB',NULL,'MANUAL','CONFIRMED',1,'MANUAL',NULL,1,1763215787702,1763215787702);
INSERT INTO list_entries VALUES('cmi0d5l11004b6d8v2oqcylav','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Valentina','Rossi','+39 333 5372176','valentina.rossi120@yahoo.it','NB',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787702,1763215787702);
INSERT INTO list_entries VALUES('cmi0d5l12004d6d8vgotlenby','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Elena','Romano','+39 331 5488465','elena.romano121@libero.it','M',NULL,'MANUAL','PENDING',1,'MANUAL',NULL,1,1763215787702,1763215787702);
INSERT INTO list_entries VALUES('cmi0d5l12004f6d8vzxl3vrww','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Federica','Verdi','+39 339 2524414','federica.verdi122@tiscali.it','M',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787703,1763215787703);
INSERT INTO list_entries VALUES('cmi0d5l13004h6d8v2z0zlgzl','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Chiara','Costa','+39 338 8228105','chiara.costa123@tiscali.it','NB',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787703,1763215787703);
INSERT INTO list_entries VALUES('cmi0d5l13004j6d8vhgzrovsl','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Andrea','Verdi','+39 332 8691131','andrea.verdi124@tiscali.it','M',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787703,1763215787703);
INSERT INTO list_entries VALUES('cmi0d5l13004l6d8vy5ibishf','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Andrea','De Luca','+39 334 8248546','andrea.de luca125@hotmail.it','M',NULL,'MANUAL','PENDING',1,'MANUAL',NULL,1,1763215787704,1763215787704);
INSERT INTO list_entries VALUES('cmi0d5l14004n6d8vvm8s6uw1','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Sara','Romano','+39 335 9277118','sara.romano126@hotmail.it','NB',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787704,1763215787704);
INSERT INTO list_entries VALUES('cmi0d5l14004p6d8v5arr8x55','cmi0d5l0f00136d8vhqowwm98',NULL,'cmi0d5jsc00056d8vifbwd5ib','Valentina','Ricci','+39 336 5393433','valentina.ricci127@hotmail.it','F',NULL,'MANUAL','PENDING',0,'MANUAL',NULL,1,1763215787705,1763215787705);
INSERT INTO list_entries VALUES('cmi0d5l14004r6d8vnvfsxhjh','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Elena','Mancini','+39 342 4021437','vip.elena.mancini@libero.it','F','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787705,1763215787705);
INSERT INTO list_entries VALUES('cmi0d5l15004t6d8v5m4osf4o','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Davide','Giordano','+39 344 5077443','vip.davide.giordano@gmail.com','M','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787705,1763215787705);
INSERT INTO list_entries VALUES('cmi0d5l15004v6d8v5banzfwh','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Lorenzo','Costa','+39 346 2563449','vip.lorenzo.costa@tiscali.it','NB','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787706,1763215787706);
INSERT INTO list_entries VALUES('cmi0d5l16004x6d8vnzzdokji','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Luca','Marino','+39 344 9408315','vip.luca.marino@tiscali.it','F','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787706,1763215787706);
INSERT INTO list_entries VALUES('cmi0d5l16004z6d8vm1nrtqmm','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Marco','Costa','+39 341 5521218','vip.marco.costa@tiscali.it','NB','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787706,1763215787706);
INSERT INTO list_entries VALUES('cmi0d5l1600516d8v1b3w9oqw','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Lorenzo','Gallo','+39 343 9699153','vip.lorenzo.gallo@gmail.com','F','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787707,1763215787707);
INSERT INTO list_entries VALUES('cmi0d5l1700536d8vwm1y5c4d','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Marco','Neri','+39 345 9954875','vip.marco.neri@tiscali.it','M','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787707,1763215787707);
INSERT INTO list_entries VALUES('cmi0d5l1700556d8vgf352xph','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Lorenzo','Rizzo','+39 343 3172612','vip.lorenzo.rizzo@gmail.com','F','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787708,1763215787708);
INSERT INTO list_entries VALUES('cmi0d5l1700576d8ve4uv602y','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Federica','Ricci','+39 343 2037359','vip.federica.ricci@hotmail.it','F','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787708,1763215787708);
INSERT INTO list_entries VALUES('cmi0d5l1800596d8v4sih8cr0','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Martina','Marino','+39 340 4471099','vip.martina.marino@hotmail.it','NB','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787708,1763215787708);
INSERT INTO list_entries VALUES('cmi0d5l18005b6d8v05yjjdnz','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Lorenzo','Rossi','+39 349 4508217','vip.lorenzo.rossi@hotmail.it','F','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787709,1763215787709);
INSERT INTO list_entries VALUES('cmi0d5l19005d6d8vllwa5z5j','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Davide','Gallo','+39 342 7316956','vip.davide.gallo@hotmail.it','NB','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787709,1763215787709);
INSERT INTO list_entries VALUES('cmi0d5l19005f6d8vo5kmuu5e','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Chiara','Marino','+39 342 1182675','vip.chiara.marino@yahoo.it','NB','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787709,1763215787709);
INSERT INTO list_entries VALUES('cmi0d5l19005h6d8v1g7mnyic','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Giulia','Rossi','+39 343 6498965','vip.giulia.rossi@yahoo.it','M','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787710,1763215787710);
INSERT INTO list_entries VALUES('cmi0d5l1a005j6d8vfhat9v10','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Francesco','Giordano','+39 345 7145785','vip.francesco.giordano@tiscali.it','M','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787710,1763215787710);
INSERT INTO list_entries VALUES('cmi0d5l1a005l6d8vsyzd2ka6','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Marco','Verdi','+39 343 9385953','vip.marco.verdi@tiscali.it','F','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787711,1763215787711);
INSERT INTO list_entries VALUES('cmi0d5l1b005n6d8v80cl70su','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Sara','Greco','+39 347 4269166','vip.sara.greco@hotmail.it','F','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787711,1763215787711);
INSERT INTO list_entries VALUES('cmi0d5l1b005p6d8vvx48trd1','cmi0d5l0f00156d8vis2xfml4',NULL,'cmi0d5jha00016d8v2fkh2wb2','Elena','Verdi','+39 341 8989456','vip.elena.verdi@hotmail.it','NB','VIP Guest','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787712,1763215787712);
INSERT INTO list_entries VALUES('cmi0d5l1b005r6d8v2h8xzhm8','cmi0d5l0g00176d8vmranav85',NULL,'cmi0d5jha00016d8v2fkh2wb2','Anna','Staff','+39 327 9384855','anna.staff@panico.app','F','Staff Member','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787712,1763215787712);
INSERT INTO list_entries VALUES('cmi0d5l1c005t6d8vuhngbmew','cmi0d5l0g00176d8vmranav85',NULL,'cmi0d5jha00016d8v2fkh2wb2','Giuseppe','Staff','+39 328 7261874','giuseppe.staff@panico.app','M','Staff Member','MANUAL','CONFIRMED',0,'MANUAL',NULL,1,1763215787712,1763215787712);
CREATE TABLE IF NOT EXISTS "checkins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "scannedByUserId" TEXT NOT NULL,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gate" TEXT NOT NULL DEFAULT 'MAIN',
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "arrivalTime" TEXT,
    "groupSize" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "checkins_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "checkins_scannedByUserId_fkey" FOREIGN KEY ("scannedByUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO checkins VALUES('cmi0d5l3200a16d8v43y779fg','cmi0d5l1f005v6d8vq6h6fij7','cmi0d5k3c000b6d8v143n2cfw',1762634207675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3400a36d8vw6cu419r','cmi0d5l1g005x6d8vitjke2e6','cmi0d5k3c000b6d8v143n2cfw',1762636847675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3500a56d8vyyudkdnw','cmi0d5l1h005z6d8v7d6l9w0h','cmi0d5k8u000c6d8vy9zmucpv',1762638947675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3500a76d8vls3j1cki','cmi0d5l1i00616d8vczouz5pk','cmi0d5k3c000b6d8v143n2cfw',1762642307675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3600a96d8vtczgbeb9','cmi0d5l1j00636d8vzcaztocp','cmi0d5k8u000c6d8vy9zmucpv',1762641467675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3700ab6d8vfrxrcg9r','cmi0d5l1k00656d8vshgp552o','cmi0d5k8u000c6d8vy9zmucpv',1762639127675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3800ad6d8vl435gt6u','cmi0d5l1l00676d8vrfkmnvji','cmi0d5k3c000b6d8v143n2cfw',1762642847675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3800af6d8vgyo0s11s','cmi0d5l1m00696d8vttuuljoc','cmi0d5k3c000b6d8v143n2cfw',1762642007675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3900ah6d8von32mu4x','cmi0d5l1m006b6d8vlbptso0k','cmi0d5k3c000b6d8v143n2cfw',1762642787675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3a00aj6d8vxkpveitz','cmi0d5l1n006d6d8vbup1ha26','cmi0d5k3c000b6d8v143n2cfw',1762637267675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3b00al6d8vkiw68eh8','cmi0d5l1o006f6d8vun3rqgxz','cmi0d5k3c000b6d8v143n2cfw',1762641107675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3b00an6d8vqxycnc9n','cmi0d5l1p006h6d8vvn4o87bt','cmi0d5k8u000c6d8vy9zmucpv',1762635527675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3c00ap6d8v06jkt23h','cmi0d5l1q006j6d8vnunjscv5','cmi0d5k3c000b6d8v143n2cfw',1762635707675,'VIP',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3d00ar6d8vaaqakthe','cmi0d5l1q006l6d8v61gibd68','cmi0d5k8u000c6d8vy9zmucpv',1762635107675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3e00at6d8vz0i6xj52','cmi0d5l1r006n6d8vni0glu4p','cmi0d5k8u000c6d8vy9zmucpv',1762632047675,'VIP',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3e00av6d8ve7uq3qf3','cmi0d5l1s006p6d8v1emqlcp6','cmi0d5k3c000b6d8v143n2cfw',1762644947675,'VIP',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3f00ax6d8vrmt22uiu','cmi0d5l1t006r6d8v7kvjyrao','cmi0d5k3c000b6d8v143n2cfw',1762642607675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3g00az6d8v2bu77gvc','cmi0d5l1u006t6d8vfyom4ikj','cmi0d5k3c000b6d8v143n2cfw',1762646387675,'VIP',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3h00b16d8vjd6wxz7c','cmi0d5l1u006v6d8v97k68d33','cmi0d5k3c000b6d8v143n2cfw',1762643627675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3h00b36d8v7bkq5x8a','cmi0d5l1v006x6d8vlp5g2frh','cmi0d5k3c000b6d8v143n2cfw',1762641827675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3i00b56d8vay2y6hdk','cmi0d5l1w006z6d8v40gxiqke','cmi0d5k8u000c6d8vy9zmucpv',1762643927675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3j00b76d8vjg84a3fr','cmi0d5l1x00716d8vd78hxzy3','cmi0d5k8u000c6d8vy9zmucpv',1762633487675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3k00b96d8vtgphexw2','cmi0d5l1x00736d8vde6mekto','cmi0d5k3c000b6d8v143n2cfw',1762633847675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3k00bb6d8vvkbvkdtj','cmi0d5l1y00756d8vyuuw5kay','cmi0d5k3c000b6d8v143n2cfw',1762638707675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3l00bd6d8vdk1q4bsa','cmi0d5l1z00776d8vro67jper','cmi0d5k8u000c6d8vy9zmucpv',1762640447675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3m00bf6d8v2d5cxk7n','cmi0d5l2000796d8v5dfg98il','cmi0d5k8u000c6d8vy9zmucpv',1762637927675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3n00bh6d8vyugrgiar','cmi0d5l21007b6d8vlhctk0ml','cmi0d5k8u000c6d8vy9zmucpv',1762643747675,'VIP',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3n00bj6d8v1184uzig','cmi0d5l21007d6d8v44sl7s96','cmi0d5k3c000b6d8v143n2cfw',1762635467675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3o00bl6d8v8ekn0yxs','cmi0d5l22007f6d8v6q6150qz','cmi0d5k8u000c6d8vy9zmucpv',1762645427675,'VIP',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3p00bn6d8v7iiokljo','cmi0d5l23007h6d8vwwwoa1k9','cmi0d5k3c000b6d8v143n2cfw',1762639487675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3p00bp6d8vy5mujwfa','cmi0d5l24007j6d8vr9mh7kgd','cmi0d5k8u000c6d8vy9zmucpv',1762632827675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3q00br6d8v2w6iq862','cmi0d5l24007l6d8v4hei82o4','cmi0d5k8u000c6d8vy9zmucpv',1762641707675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3r00bt6d8vfipw8o5n','cmi0d5l25007n6d8vxxlk6ulg','cmi0d5k3c000b6d8v143n2cfw',1762640267675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3s00bv6d8vjs446oc8','cmi0d5l26007p6d8vj8h9rj8t','cmi0d5k3c000b6d8v143n2cfw',1762644107675,'VIP',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3t00bx6d8vavvt3dc3','cmi0d5l27007r6d8vpps20po9','cmi0d5k8u000c6d8vy9zmucpv',1762643627675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3u00bz6d8vqm2rtdbr','cmi0d5l28007t6d8v0d8p8tcd','cmi0d5k3c000b6d8v143n2cfw',1762636427675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3v00c16d8vobsn22kz','cmi0d5l28007v6d8v676lyftf','cmi0d5k8u000c6d8vy9zmucpv',1762645967675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3v00c36d8vfyvooeyi','cmi0d5l29007x6d8v9c7ss677','cmi0d5k8u000c6d8vy9zmucpv',1762645607675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3w00c56d8vk5c87rqs','cmi0d5l2a007z6d8vjyjguvmo','cmi0d5k3c000b6d8v143n2cfw',1762637267675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3x00c76d8vdiwnpn14','cmi0d5l2b00816d8vhb8o3005','cmi0d5k3c000b6d8v143n2cfw',1762636367675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3y00c96d8vfva1o921','cmi0d5l2b00836d8vuazz7s1c','cmi0d5k8u000c6d8vy9zmucpv',1762638167675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3z00cb6d8vr19l01oh','cmi0d5l2c00856d8vctpobism','cmi0d5k8u000c6d8vy9zmucpv',1762633067675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l3z00cd6d8vrro4gimv','cmi0d5l2d00876d8v8d9htbh8','cmi0d5k8u000c6d8vy9zmucpv',1762633667675,'VIP',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l4000cf6d8va74oicz0','cmi0d5l2e00896d8vq7wo9urv','cmi0d5k3c000b6d8v143n2cfw',1762633847675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l4100ch6d8v8i6yz357','cmi0d5l2f008b6d8vqt6wzc1z','cmi0d5k3c000b6d8v143n2cfw',1762632947675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l4200cj6d8v1xqq17ak','cmi0d5l2f008d6d8vqonotk5h','cmi0d5k8u000c6d8vy9zmucpv',1762645007675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l4200cl6d8vsu3fb691','cmi0d5l2g008f6d8vzaf5lsdf','cmi0d5k8u000c6d8vy9zmucpv',1762634747675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l4300cn6d8vccyenj3y','cmi0d5l2h008h6d8vpksjota0','cmi0d5k8u000c6d8vy9zmucpv',1762638527675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l4400cp6d8v786g8ba5','cmi0d5l2i008j6d8vizoerqjy','cmi0d5k8u000c6d8vy9zmucpv',1762641587675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l4500cr6d8v7yirhpuv','cmi0d5l2i008l6d8v90fnwuiv','cmi0d5k3c000b6d8v143n2cfw',1762638647675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l4500ct6d8v2wfcaoa3','cmi0d5l2j008n6d8vg9m32pn7','cmi0d5k3c000b6d8v143n2cfw',1762634267675,'MAIN',1,NULL,NULL,1);
INSERT INTO checkins VALUES('cmi0d5l4600cv6d8vzibt3xrf','cmi0d5l2k008p6d8v3znu1xgp','cmi0d5k8u000c6d8vy9zmucpv',1762634207675,'MAIN',1,NULL,NULL,1);
CREATE TABLE IF NOT EXISTS "invite_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdByUserId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "prProfileId" TEXT,
    "slug" TEXT NOT NULL,
    "maxUses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "invite_links_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invite_links_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invite_links_prProfileId_fkey" FOREIGN KEY ("prProfileId") REFERENCES "pr_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO invite_links VALUES('cmi0d5l4700cx6d8vj2frwhmr','cmi0d5jms00026d8v44rou58m','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5jmu00046d8vf4z54z6x','marco-notte-bianca-2024',50,12,1763734187674,'instagram','social','notte-bianca-promo',1763215787815,1763215787815);
INSERT INTO invite_links VALUES('cmi0d5l4700cz6d8vrtouky4m','cmi0d5jsc00056d8vifbwd5ib','cmi0d5l0c000n6d8vnjsdyelp','cmi0d5jsd00076d8vogfxqjkz','sofia-beach-party-summer',60,8,1764338987675,'whatsapp','messaging','beach-party-invite',1763215787816,1763215787816);
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO audit_logs VALUES('cmi0d5l4700d16d8vjil6suuf','cmi0d5jms00026d8v44rou58m','user.login','User','cmi0d5jms00026d8v44rou58m','{"timestamp":"2025-11-15T14:09:47.815Z"}',1763215787816);
INSERT INTO audit_logs VALUES('cmi0d5l4800d36d8vvrdg1pzd','cmi0d5jha00016d8v2fkh2wb2','event.create','Event','cmi0d5l0b000l6d8v6qyvwdgn','{"timestamp":"2025-11-15T14:09:47.816Z"}',1763215787817);
INSERT INTO audit_logs VALUES('cmi0d5l4800d56d8vuoec1vx6','cmi0d5jha00016d8v2fkh2wb2','list.add_entry','ListEntry','cmi0d5l0g00196d8vuvvm04tj','{"timestamp":"2025-11-15T14:09:47.816Z"}',1763215787817);
INSERT INTO audit_logs VALUES('cmi0d5l4900d76d8vtud1ajxy','cmi0d5jha00016d8v2fkh2wb2','ticket.issue','Ticket','cmi0d5l1f005v6d8vq6h6fij7','{"timestamp":"2025-11-15T14:09:47.817Z"}',1763215787817);
INSERT INTO audit_logs VALUES('cmi0d5l4900d96d8vyj4dnwhw','cmi0d5jms00026d8v44rou58m','checkin.scan','CheckIn','checkin-1','{"timestamp":"2025-11-15T14:09:47.817Z"}',1763215787817);
CREATE TABLE IF NOT EXISTS "consumptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "items" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "consumptions_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "consumptions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "funnel_tracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "eventId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "ipAddress" TEXT, "referer" TEXT, "userAgent" TEXT,
    CONSTRAINT "funnel_tracking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "event_feedbacks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "ticketId" TEXT,
    "guestId" TEXT,
    "overallRating" INTEGER NOT NULL,
    "musicRating" INTEGER,
    "serviceRating" INTEGER,
    "venueRating" INTEGER,
    "comment" TEXT,
    "wouldReturn" BOOLEAN,
    "interests" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_feedbacks_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_feedbacks_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "event_feedbacks_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "security_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestId" TEXT,
    "eventId" TEXT,
    "ticketId" TEXT,
    "severity" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportedByUserId" TEXT NOT NULL,
    "actionTaken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "security_notes_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "security_notes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "security_notes_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "security_notes_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "customer_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestId" TEXT NOT NULL,
    "musicGenres" JSONB,
    "dressStyle" TEXT,
    "drinkPreferences" JSONB,
    "avgSpending" REAL,
    "responseToPromo" TEXT,
    "socialEngagement" TEXT,
    "conversionScore" REAL,
    "lifetimeValue" REAL,
    "updatedAt" DATETIME NOT NULL, "consents" JSONB,
    CONSTRAINT "customer_preferences_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "guestId" TEXT,
    "listEntryId" TEXT,
    "issuedByUserId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'LIST',
    "price" REAL,
    "currency" TEXT DEFAULT 'EUR',
    "code" TEXT NOT NULL,
    "qrData" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tickets_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tickets_listEntryId_fkey" FOREIGN KEY ("listEntryId") REFERENCES "list_entries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tickets_issuedByUserId_fkey" FOREIGN KEY ("issuedByUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO tickets VALUES('cmi0d5l1f005v6d8vq6h6fij7','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0g00196d8vuvvm04tj','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-001','{"ticketId":"CLUB-151125-001","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.715Z"}','USED',1763215787716,1763215787775);
INSERT INTO tickets VALUES('cmi0d5l1g005x6d8vitjke2e6','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0h001b6d8v0ohq561o','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-002','{"ticketId":"CLUB-151125-002","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.716Z"}','USED',1763215787717,1763215787777);
INSERT INTO tickets VALUES('cmi0d5l1h005z6d8v7d6l9w0h','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0h001d6d8v3wyxtxri','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-003','{"ticketId":"CLUB-151125-003","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.717Z"}','USED',1763215787718,1763215787777);
INSERT INTO tickets VALUES('cmi0d5l1i00616d8vczouz5pk','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0i001f6d8vct6komtb','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-004','{"ticketId":"CLUB-151125-004","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.718Z"}','USED',1763215787719,1763215787778);
INSERT INTO tickets VALUES('cmi0d5l1j00636d8vzcaztocp','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0i001h6d8vr4isynxb','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-005','{"ticketId":"CLUB-151125-005","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.719Z"}','USED',1763215787719,1763215787779);
INSERT INTO tickets VALUES('cmi0d5l1k00656d8vshgp552o','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0i001j6d8vg3227m0f','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-006','{"ticketId":"CLUB-151125-006","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.720Z"}','USED',1763215787720,1763215787779);
INSERT INTO tickets VALUES('cmi0d5l1l00676d8vrfkmnvji','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0j001l6d8vz7lp1rua','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-007','{"ticketId":"CLUB-151125-007","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.721Z"}','USED',1763215787721,1763215787781);
INSERT INTO tickets VALUES('cmi0d5l1m00696d8vttuuljoc','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0j001n6d8vqq9pgdbb','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-008','{"ticketId":"CLUB-151125-008","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.721Z"}','USED',1763215787722,1763215787781);
INSERT INTO tickets VALUES('cmi0d5l1m006b6d8vlbptso0k','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0k001p6d8vfawjjq2p','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-009','{"ticketId":"CLUB-151125-009","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.722Z"}','USED',1763215787723,1763215787782);
INSERT INTO tickets VALUES('cmi0d5l1n006d6d8vbup1ha26','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0k001r6d8vvlro2ikk','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-010','{"ticketId":"CLUB-151125-010","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.723Z"}','USED',1763215787724,1763215787783);
INSERT INTO tickets VALUES('cmi0d5l1o006f6d8vun3rqgxz','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0l001t6d8v95mxbxwe','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-011','{"ticketId":"CLUB-151125-011","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.724Z"}','USED',1763215787724,1763215787784);
INSERT INTO tickets VALUES('cmi0d5l1p006h6d8vvn4o87bt','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0l001v6d8vx56hqjog','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-012','{"ticketId":"CLUB-151125-012","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.725Z"}','USED',1763215787725,1763215787784);
INSERT INTO tickets VALUES('cmi0d5l1q006j6d8vnunjscv5','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0l001x6d8vywjdc6f1','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-013','{"ticketId":"CLUB-151125-013","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.725Z"}','USED',1763215787726,1763215787785);
INSERT INTO tickets VALUES('cmi0d5l1q006l6d8v61gibd68','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0m001z6d8v3eg9slin','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-014','{"ticketId":"CLUB-151125-014","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.726Z"}','USED',1763215787727,1763215787786);
INSERT INTO tickets VALUES('cmi0d5l1r006n6d8vni0glu4p','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0m00216d8vtv2uemgr','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-015','{"ticketId":"CLUB-151125-015","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.727Z"}','USED',1763215787727,1763215787786);
INSERT INTO tickets VALUES('cmi0d5l1s006p6d8v1emqlcp6','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0m00236d8v6o2x9b6p','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-016','{"ticketId":"CLUB-151125-016","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.728Z"}','USED',1763215787728,1763215787787);
INSERT INTO tickets VALUES('cmi0d5l1t006r6d8v7kvjyrao','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0n00256d8v3fhz49fd','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-017','{"ticketId":"CLUB-151125-017","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.729Z"}','USED',1763215787729,1763215787788);
INSERT INTO tickets VALUES('cmi0d5l1u006t6d8vfyom4ikj','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0n00276d8vx7ru6kas','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-018','{"ticketId":"CLUB-151125-018","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.729Z"}','USED',1763215787730,1763215787789);
INSERT INTO tickets VALUES('cmi0d5l1u006v6d8v97k68d33','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0n00296d8v4j8mprba','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-019','{"ticketId":"CLUB-151125-019","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.730Z"}','USED',1763215787731,1763215787789);
INSERT INTO tickets VALUES('cmi0d5l1v006x6d8vlp5g2frh','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0o002b6d8v9oeuuqw6','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-020','{"ticketId":"CLUB-151125-020","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.731Z"}','USED',1763215787732,1763215787790);
INSERT INTO tickets VALUES('cmi0d5l1w006z6d8v40gxiqke','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0o002d6d8vqz282dcp','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-021','{"ticketId":"CLUB-151125-021","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.732Z"}','USED',1763215787732,1763215787791);
INSERT INTO tickets VALUES('cmi0d5l1x00716d8vd78hxzy3','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0p002f6d8vjjaqptb6','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-022','{"ticketId":"CLUB-151125-022","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.733Z"}','USED',1763215787733,1763215787792);
INSERT INTO tickets VALUES('cmi0d5l1x00736d8vde6mekto','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0p002h6d8vxv4nr8ve','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-023','{"ticketId":"CLUB-151125-023","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.733Z"}','USED',1763215787734,1763215787792);
INSERT INTO tickets VALUES('cmi0d5l1y00756d8vyuuw5kay','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0p002j6d8vyiiuqj2n','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-024','{"ticketId":"CLUB-151125-024","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.734Z"}','USED',1763215787735,1763215787793);
INSERT INTO tickets VALUES('cmi0d5l1z00776d8vro67jper','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0q002l6d8v95d90qba','cmi0d5jms00026d8v44rou58m','LIST',NULL,'EUR','CLUB-151125-025','{"ticketId":"CLUB-151125-025","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.735Z"}','USED',1763215787735,1763215787794);
INSERT INTO tickets VALUES('cmi0d5l2000796d8v5dfg98il','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0u00376d8v42b9bfl8','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-026','{"ticketId":"CLUB-151125-026","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.736Z"}','USED',1763215787736,1763215787795);
INSERT INTO tickets VALUES('cmi0d5l21007b6d8vlhctk0ml','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0u00396d8vfz91s7vp','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-027','{"ticketId":"CLUB-151125-027","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.736Z"}','USED',1763215787737,1763215787795);
INSERT INTO tickets VALUES('cmi0d5l21007d6d8v44sl7s96','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0v003b6d8vawvo0p96','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-028','{"ticketId":"CLUB-151125-028","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.737Z"}','USED',1763215787738,1763215787796);
INSERT INTO tickets VALUES('cmi0d5l22007f6d8v6q6150qz','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0v003d6d8vr7atd0v4','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-029','{"ticketId":"CLUB-151125-029","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.738Z"}','USED',1763215787739,1763215787797);
INSERT INTO tickets VALUES('cmi0d5l23007h6d8vwwwoa1k9','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0w003f6d8v2vq90tyc','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-030','{"ticketId":"CLUB-151125-030","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.739Z"}','USED',1763215787739,1763215787798);
INSERT INTO tickets VALUES('cmi0d5l24007j6d8vr9mh7kgd','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0w003h6d8v5qevrajt','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-031','{"ticketId":"CLUB-151125-031","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.739Z"}','USED',1763215787740,1763215787798);
INSERT INTO tickets VALUES('cmi0d5l24007l6d8v4hei82o4','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0w003j6d8v4vdoflv3','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-032','{"ticketId":"CLUB-151125-032","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.740Z"}','USED',1763215787741,1763215787799);
INSERT INTO tickets VALUES('cmi0d5l25007n6d8vxxlk6ulg','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0x003l6d8vg3av9xwv','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-033','{"ticketId":"CLUB-151125-033","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.741Z"}','USED',1763215787742,1763215787800);
INSERT INTO tickets VALUES('cmi0d5l26007p6d8vj8h9rj8t','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0x003n6d8vijg5jt2m','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-034','{"ticketId":"CLUB-151125-034","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.742Z"}','USED',1763215787743,1763215787801);
INSERT INTO tickets VALUES('cmi0d5l27007r6d8vpps20po9','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0x003p6d8v7564kt7b','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-035','{"ticketId":"CLUB-151125-035","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.743Z"}','USED',1763215787743,1763215787802);
INSERT INTO tickets VALUES('cmi0d5l28007t6d8v0d8p8tcd','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0y003r6d8vxgzaf3c0','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-036','{"ticketId":"CLUB-151125-036","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.744Z"}','USED',1763215787744,1763215787802);
INSERT INTO tickets VALUES('cmi0d5l28007v6d8v676lyftf','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0y003t6d8vi6imejv6','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-037','{"ticketId":"CLUB-151125-037","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.744Z"}','USED',1763215787745,1763215787803);
INSERT INTO tickets VALUES('cmi0d5l29007x6d8v9c7ss677','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0z003v6d8vnfi3dov4','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-038','{"ticketId":"CLUB-151125-038","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.745Z"}','USED',1763215787746,1763215787804);
INSERT INTO tickets VALUES('cmi0d5l2a007z6d8vjyjguvmo','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0z003x6d8vdlrsyhva','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-039','{"ticketId":"CLUB-151125-039","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.746Z"}','USED',1763215787746,1763215787805);
INSERT INTO tickets VALUES('cmi0d5l2b00816d8vhb8o3005','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l0z003z6d8vw2vy9rb8','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-040','{"ticketId":"CLUB-151125-040","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.747Z"}','USED',1763215787747,1763215787806);
INSERT INTO tickets VALUES('cmi0d5l2b00836d8vuazz7s1c','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1000416d8v2t06g5ex','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-041','{"ticketId":"CLUB-151125-041","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.747Z"}','USED',1763215787748,1763215787807);
INSERT INTO tickets VALUES('cmi0d5l2c00856d8vctpobism','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1000436d8vqger5am0','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-042','{"ticketId":"CLUB-151125-042","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.748Z"}','USED',1763215787749,1763215787808);
INSERT INTO tickets VALUES('cmi0d5l2d00876d8v8d9htbh8','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1000456d8v3f6q1fjl','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-043','{"ticketId":"CLUB-151125-043","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.749Z"}','USED',1763215787749,1763215787808);
INSERT INTO tickets VALUES('cmi0d5l2e00896d8vq7wo9urv','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1100476d8vmhdeuna3','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-044','{"ticketId":"CLUB-151125-044","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.750Z"}','USED',1763215787750,1763215787809);
INSERT INTO tickets VALUES('cmi0d5l2f008b6d8vqt6wzc1z','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1100496d8vd2rdbr73','cmi0d5jsc00056d8vifbwd5ib','LIST',NULL,'EUR','CLUB-151125-045','{"ticketId":"CLUB-151125-045","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.750Z"}','USED',1763215787751,1763215787810);
INSERT INTO tickets VALUES('cmi0d5l2f008d6d8vqonotk5h','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l14004r6d8vnvfsxhjh','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-046','{"ticketId":"CLUB-151125-046","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.751Z"}','USED',1763215787752,1763215787810);
INSERT INTO tickets VALUES('cmi0d5l2g008f6d8vzaf5lsdf','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l15004t6d8v5m4osf4o','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-047','{"ticketId":"CLUB-151125-047","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.752Z"}','USED',1763215787753,1763215787811);
INSERT INTO tickets VALUES('cmi0d5l2h008h6d8vpksjota0','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l15004v6d8v5banzfwh','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-048','{"ticketId":"CLUB-151125-048","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.753Z"}','USED',1763215787753,1763215787812);
INSERT INTO tickets VALUES('cmi0d5l2i008j6d8vizoerqjy','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l16004x6d8vnzzdokji','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-049','{"ticketId":"CLUB-151125-049","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.754Z"}','USED',1763215787754,1763215787813);
INSERT INTO tickets VALUES('cmi0d5l2i008l6d8v90fnwuiv','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l16004z6d8vm1nrtqmm','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-050','{"ticketId":"CLUB-151125-050","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.754Z"}','USED',1763215787755,1763215787813);
INSERT INTO tickets VALUES('cmi0d5l2j008n6d8vg9m32pn7','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1600516d8v1b3w9oqw','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-051','{"ticketId":"CLUB-151125-051","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.755Z"}','USED',1763215787756,1763215787814);
INSERT INTO tickets VALUES('cmi0d5l2k008p6d8v3znu1xgp','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1700536d8vwm1y5c4d','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-052','{"ticketId":"CLUB-151125-052","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.756Z"}','USED',1763215787756,1763215787815);
INSERT INTO tickets VALUES('cmi0d5l2l008r6d8ve5o1x7kw','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1700556d8vgf352xph','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-053','{"ticketId":"CLUB-151125-053","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.757Z"}','NEW',1763215787757,1763215787757);
INSERT INTO tickets VALUES('cmi0d5l2l008t6d8vye1rfyyd','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1700576d8ve4uv602y','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-054','{"ticketId":"CLUB-151125-054","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.757Z"}','NEW',1763215787758,1763215787758);
INSERT INTO tickets VALUES('cmi0d5l2m008v6d8voy5l73x8','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1800596d8v4sih8cr0','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-055','{"ticketId":"CLUB-151125-055","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.758Z"}','NEW',1763215787759,1763215787759);
INSERT INTO tickets VALUES('cmi0d5l2n008x6d8vef8g474j','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l18005b6d8v05yjjdnz','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-056','{"ticketId":"CLUB-151125-056","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.759Z"}','NEW',1763215787759,1763215787759);
INSERT INTO tickets VALUES('cmi0d5l2o008z6d8valey0sjy','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l19005d6d8vllwa5z5j','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-057','{"ticketId":"CLUB-151125-057","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.760Z"}','NEW',1763215787760,1763215787760);
INSERT INTO tickets VALUES('cmi0d5l2p00916d8v7th2i9kx','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l19005f6d8vo5kmuu5e','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-058','{"ticketId":"CLUB-151125-058","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.760Z"}','NEW',1763215787761,1763215787761);
INSERT INTO tickets VALUES('cmi0d5l2p00936d8vkeh3cowl','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l19005h6d8v1g7mnyic','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-059','{"ticketId":"CLUB-151125-059","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.761Z"}','NEW',1763215787762,1763215787762);
INSERT INTO tickets VALUES('cmi0d5l2q00956d8v8o5pkcmp','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1a005j6d8vfhat9v10','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-060','{"ticketId":"CLUB-151125-060","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.762Z"}','NEW',1763215787763,1763215787763);
INSERT INTO tickets VALUES('cmi0d5l2r00976d8vvzf1cunq','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1a005l6d8vsyzd2ka6','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-061','{"ticketId":"CLUB-151125-061","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.763Z"}','NEW',1763215787763,1763215787763);
INSERT INTO tickets VALUES('cmi0d5l2s00996d8v61u27b14','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1b005n6d8v80cl70su','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-062','{"ticketId":"CLUB-151125-062","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.764Z"}','NEW',1763215787764,1763215787764);
INSERT INTO tickets VALUES('cmi0d5l2s009b6d8vesb2aubi','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1b005p6d8vvx48trd1','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-063','{"ticketId":"CLUB-151125-063","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.764Z"}','NEW',1763215787765,1763215787765);
INSERT INTO tickets VALUES('cmi0d5l2t009d6d8vgv8jlvlv','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1b005r6d8v2h8xzhm8','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-064','{"ticketId":"CLUB-151125-064","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.765Z"}','NEW',1763215787766,1763215787766);
INSERT INTO tickets VALUES('cmi0d5l2u009f6d8vy4godw7j','cmi0d5l0b000l6d8v6qyvwdgn',NULL,NULL,'cmi0d5l1c005t6d8vuhngbmew','cmi0d5jha00016d8v2fkh2wb2','LIST',NULL,'EUR','CLUB-151125-065','{"ticketId":"CLUB-151125-065","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"LIST","issuedAt":"2025-11-15T14:09:47.766Z"}','NEW',1763215787766,1763215787766);
INSERT INTO tickets VALUES('cmi0d5l2v009h6d8vgogt5uqv','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5keb000d6d8v8aw9u57l',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-066','{"ticketId":"CLUB-151125-066","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.767Z"}','NEW',1763215787767,1763215787767);
INSERT INTO tickets VALUES('cmi0d5l2w009j6d8vmqbb0len','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5kjt000e6d8vgsoc0wxl',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-067','{"ticketId":"CLUB-151125-067","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.767Z"}','NEW',1763215787768,1763215787768);
INSERT INTO tickets VALUES('cmi0d5l2x009l6d8v4w3l1sdw','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5kpa000f6d8vkgyh4hpj',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-068','{"ticketId":"CLUB-151125-068","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.769Z"}','NEW',1763215787769,1763215787769);
INSERT INTO tickets VALUES('cmi0d5l2x009n6d8vm9iaxvgl','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5kus000g6d8vfkm3jqtw',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-069','{"ticketId":"CLUB-151125-069","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.769Z"}','NEW',1763215787770,1763215787770);
INSERT INTO tickets VALUES('cmi0d5l2y009p6d8vvrh0aodb','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5l09000h6d8vibgb2ymh',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-070','{"ticketId":"CLUB-151125-070","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.770Z"}','NEW',1763215787771,1763215787771);
INSERT INTO tickets VALUES('cmi0d5l2z009r6d8vavwiag53','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5keb000d6d8v8aw9u57l',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-071','{"ticketId":"CLUB-151125-071","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.771Z"}','NEW',1763215787771,1763215787771);
INSERT INTO tickets VALUES('cmi0d5l30009t6d8v17765r89','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5kjt000e6d8vgsoc0wxl',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-072','{"ticketId":"CLUB-151125-072","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.772Z"}','NEW',1763215787772,1763215787772);
INSERT INTO tickets VALUES('cmi0d5l30009v6d8vzdzj7r4z','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5kpa000f6d8vkgyh4hpj',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-073','{"ticketId":"CLUB-151125-073","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.772Z"}','NEW',1763215787773,1763215787773);
INSERT INTO tickets VALUES('cmi0d5l31009x6d8v5yuh327e','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5kus000g6d8vfkm3jqtw',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-074','{"ticketId":"CLUB-151125-074","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.773Z"}','NEW',1763215787774,1763215787774);
INSERT INTO tickets VALUES('cmi0d5l32009z6d8vf6o9j9nn','cmi0d5l0b000l6d8v6qyvwdgn','cmi0d5l09000h6d8vibgb2ymh',NULL,NULL,'cmi0d5jha00016d8v2fkh2wb2','FREE',NULL,'EUR','CLUB-151125-075','{"ticketId":"CLUB-151125-075","eventId":"cmi0d5l0b000l6d8v6qyvwdgn","type":"FREE","issuedAt":"2025-11-15T14:09:47.774Z"}','NEW',1763215787775,1763215787775);
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE INDEX "events_status_dateStart_idx" ON "events"("status", "dateStart");
CREATE INDEX "events_venueId_idx" ON "events"("venueId");
CREATE UNIQUE INDEX "pr_profiles_userId_key" ON "pr_profiles"("userId");
CREATE UNIQUE INDEX "pr_profiles_referralCode_key" ON "pr_profiles"("referralCode");
CREATE INDEX "pr_profiles_referralCode_idx" ON "pr_profiles"("referralCode");
CREATE UNIQUE INDEX "assignments_eventId_prProfileId_key" ON "assignments"("eventId", "prProfileId");
CREATE INDEX "lists_eventId_type_idx" ON "lists"("eventId", "type");
CREATE INDEX "guests_email_idx" ON "guests"("email");
CREATE INDEX "guests_phone_idx" ON "guests"("phone");
CREATE INDEX "guests_instagram_idx" ON "guests"("instagram");
CREATE INDEX "guests_customerSegment_idx" ON "guests"("customerSegment");
CREATE INDEX "list_entries_listId_status_idx" ON "list_entries"("listId", "status");
CREATE INDEX "list_entries_email_idx" ON "list_entries"("email");
CREATE INDEX "list_entries_phone_idx" ON "list_entries"("phone");
CREATE INDEX "list_entries_bookingMethod_idx" ON "list_entries"("bookingMethod");
CREATE INDEX "checkins_ticketId_idx" ON "checkins"("ticketId");
CREATE INDEX "checkins_scannedAt_idx" ON "checkins"("scannedAt");
CREATE INDEX "checkins_gate_idx" ON "checkins"("gate");
CREATE UNIQUE INDEX "invite_links_slug_key" ON "invite_links"("slug");
CREATE INDEX "invite_links_slug_idx" ON "invite_links"("slug");
CREATE INDEX "invite_links_eventId_idx" ON "invite_links"("eventId");
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
CREATE INDEX "consumptions_ticketId_idx" ON "consumptions"("ticketId");
CREATE INDEX "consumptions_eventId_idx" ON "consumptions"("eventId");
CREATE INDEX "consumptions_createdAt_idx" ON "consumptions"("createdAt");
CREATE INDEX "funnel_tracking_sessionId_idx" ON "funnel_tracking"("sessionId");
CREATE INDEX "funnel_tracking_eventId_idx" ON "funnel_tracking"("eventId");
CREATE INDEX "funnel_tracking_step_idx" ON "funnel_tracking"("step");
CREATE INDEX "funnel_tracking_timestamp_idx" ON "funnel_tracking"("timestamp");
CREATE INDEX "event_feedbacks_eventId_idx" ON "event_feedbacks"("eventId");
CREATE INDEX "event_feedbacks_guestId_idx" ON "event_feedbacks"("guestId");
CREATE INDEX "event_feedbacks_overallRating_idx" ON "event_feedbacks"("overallRating");
CREATE INDEX "security_notes_guestId_idx" ON "security_notes"("guestId");
CREATE INDEX "security_notes_severity_idx" ON "security_notes"("severity");
CREATE INDEX "security_notes_eventId_idx" ON "security_notes"("eventId");
CREATE UNIQUE INDEX "customer_preferences_guestId_key" ON "customer_preferences"("guestId");
CREATE UNIQUE INDEX "tickets_code_key" ON "tickets"("code");
CREATE INDEX "tickets_code_idx" ON "tickets"("code");
CREATE INDEX "tickets_eventId_status_idx" ON "tickets"("eventId", "status");
CREATE INDEX "tickets_userId_idx" ON "tickets"("userId");
CREATE INDEX "tickets_guestId_idx" ON "tickets"("guestId");
CREATE INDEX "guests_telegramChatId_idx" ON "guests"("telegramChatId");
COMMIT;
