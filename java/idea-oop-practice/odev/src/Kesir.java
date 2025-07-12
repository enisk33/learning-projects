
public class Kesir {
    private String plaka;
    private sayı sahip;

    public Kesir( String plakaNo ) { plaka = plakaNo; }
    public Kesir(String plaka, sayı sahip) {
        this.plaka = plaka;
        setSahip(sahip);
    }
    public void setSahip( sayı sahip ) {
        this.sahip = sahip;
        if( sahip.getAraba() != this )
            sahip.setAraba(this);
    }
    public sayı getSahip() { return sahip; }
    public String getPlaka( ) { return plaka; }
    public void setPlaka( String plaka ) { this.plaka = plaka; }
    public String kendiniTanit( ) {
        String tanitim;
        tanitim = "[ARABA] Plakam: " + getPlaka() +
                " Sahibimin ad�: " + sahip.getIsim();
        return tanitim;
    }
}
