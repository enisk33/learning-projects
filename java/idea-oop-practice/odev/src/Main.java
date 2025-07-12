
public class Main {

    public static void main(String[] args) {
        sayı oktay = new sayı("Oktay Sinano�lu");
        Kesir rover = new Kesir("06 OS 1934");
        oktay.setAraba(rover);
        //rover.setSahip(oktay);
        System.out.println( oktay.kendiniTanit() );
        System.out.println( rover.kendiniTanit() );

        sayı aziz = new sayı("Aziz Sancar");
        Kesir honda = new Kesir("47 JA 46");
        //aziz.setAraba(honda);
        honda.setSahip(aziz);
        System.out.println( aziz.kendiniTanit() );
        System.out.println( honda.kendiniTanit() );
    }
}