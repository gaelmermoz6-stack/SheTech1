-- AlterTable
ALTER TABLE "formations" ADD COLUMN     "ordre" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parcours_id" INTEGER;

-- AlterTable
ALTER TABLE "projets" ADD COLUMN     "origine" TEXT NOT NULL DEFAULT 'proposition';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "telephone" VARCHAR(30);

-- CreateTable
CREATE TABLE "parcours" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(500),
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parcours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formation_quiz" (
    "id" SERIAL NOT NULL,
    "formation_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "option_a" TEXT NOT NULL,
    "option_b" TEXT NOT NULL,
    "option_c" TEXT,
    "option_d" TEXT,
    "reponse_correcte" TEXT NOT NULL,
    "explication" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "formation_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formation_quiz_resultats" (
    "user_id" INTEGER NOT NULL,
    "formation_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "reussi" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formation_quiz_resultats_pkey" PRIMARY KEY ("user_id","formation_id")
);

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_parcours_id_fkey" FOREIGN KEY ("parcours_id") REFERENCES "parcours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_quiz" ADD CONSTRAINT "formation_quiz_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_quiz_resultats" ADD CONSTRAINT "formation_quiz_resultats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formation_quiz_resultats" ADD CONSTRAINT "formation_quiz_resultats_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

