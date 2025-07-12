
public class sayı {
    private String isim;
    private Kesir araba;

    public sayı( String isim ) {
        this.isim = isim;
    }
    public String getIsim( ) { return isim; }
    public Kesir getAraba( ) { return araba; }
    public void setAraba( Kesir araba ) {
        this.araba = araba;
        if( araba.getSahip() != this )
            araba.setSahip(this);
    }
    public String kendiniTanit( ) {
        String tanitim = "[INSAN] Ad�m: " + isim;
        if( araba != null )
            tanitim += " Arac�m�n plakas�: " + araba.getPlaka();
        return tanitim;
    }

}
