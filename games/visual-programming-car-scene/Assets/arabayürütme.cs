using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class arabayürütme : MonoBehaviour
{
    private float m_horizontalInput;
    private float m_verticalInput;
    private float m_steeringAngle;

    public WheelCollider frontDriverW, frontPassengerW;
    public WheelCollider rearDriverW, rearPassengerW;
    public float maxSteerAngle = 30;
    public float motorForce = 3000; // Motor kuvvetini artırdım
    private Rigidbody carrigid;

    // Trail Renderer bileşenleri için referanslar
    public TrailRenderer leftTireTrail;
    public TrailRenderer rightTireTrail;

    private bool isSliding = false;

    void Start()
    {
        carrigid = GetComponent<Rigidbody>();
        carrigid.centerOfMass = new Vector3(0, -0.5f, 0); // Ağırlık merkezini aşağı çek
    }

    public void GetInput()
    {
        m_horizontalInput = Input.GetAxis("Horizontal");
        m_verticalInput = Input.GetAxis("Vertical");
    }

    private void Steer()
    {
        m_steeringAngle = maxSteerAngle * m_horizontalInput;
        frontDriverW.steerAngle = m_steeringAngle;
        frontPassengerW.steerAngle = m_steeringAngle;
    }

    private void Accelerate()
    {
        frontDriverW.motorTorque = m_verticalInput * motorForce;
        frontPassengerW.motorTorque = m_verticalInput * motorForce;
        rearDriverW.motorTorque = m_verticalInput * motorForce;
        rearPassengerW.motorTorque = m_verticalInput * motorForce;
    }

    private void Update()
    {
        GetInput();
        Steer();
        Accelerate();

        // Aracın kayma durumunu kontrol et
        if (Mathf.Abs(m_horizontalInput) > 0.3f)
        {
            isSliding = true;
        }
        else
        {
            isSliding = false;
        }

        ManageTrails();
    }

    private void ManageTrails()
    {
        if (isSliding)
        {
            ActivateTrail(leftTireTrail);
            ActivateTrail(rightTireTrail);
        }
        else
        {
            DeactivateTrail(leftTireTrail);
            DeactivateTrail(rightTireTrail);
        }
    }

    private void ActivateTrail(TrailRenderer trail)
    {
        if (!trail.emitting)
        {
            trail.emitting = true;
        }
    }

    private void DeactivateTrail(TrailRenderer trail)
    {
        if (trail.emitting)
        {
            trail.emitting = false;
        }
    }
}