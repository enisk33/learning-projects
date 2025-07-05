public class Main{
    public static void main(String[] args) {
        Calisan[] calisanlar = new Calisan[3];;
        Yonetici mudur = new Yonetici( "Oktay Sinanoğlu", 10000);
        mudur.setBonus( 2500);
        calisanlar[0] =mudur;
        calisanlar[1] = new Calisan( "Attila İlhan", 7500 );
        calisanlar[2] = new Calisan( "Ümit Zileli", 6000 );
        for( Calisan calisan : calisanlar )
            System.out.println( calisan.getIsim() + " " +
                    calisan.getMaas( ) );
    }
}
