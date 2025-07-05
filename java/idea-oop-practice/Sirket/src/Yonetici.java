public class Yonetici extends Calisan {
    private int bonus;
    public Yonetici( String isim, int maas ) {
        super( isim, maas);
        bonus =0;
    }
    public void setBonus( int bonus ) {
        this.bonus =bonus;
    }
    public int getMaas( ){
        return super.getMaas( ) +bonus;
    }}