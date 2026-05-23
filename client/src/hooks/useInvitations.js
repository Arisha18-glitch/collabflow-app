import { useReducer, useCallback, useEffect } from 'react';
import { createInvitationAPI, fetchInvitationsAPI, revokeInvitationAPI } from '../services/api';

/**
 * useInvitations — custom hook implementing the asymmetric invitation
 * state machine. All console traces are production-guarded.
 *
 * States: idle → dispatching → confirmed / error
 */

const INVITE_STATES = {
    IDLE: 'idle',
    DISPATCHING: 'dispatching',
    CONFIRMED: 'confirmed',
    ERROR: 'error',
};

function inviteReducer(state, action) {
    switch (action.type) {
        case 'START_DISPATCH':
            return { ...state, formState: INVITE_STATES.DISPATCHING, error: null };
        case 'DISPATCH_SUCCESS':
            return {
                ...state,
                formState: INVITE_STATES.CONFIRMED,
                invitations: [action.payload, ...state.invitations],
                error: null,
            };
        case 'DISPATCH_ERROR':
            return { ...state, formState: INVITE_STATES.ERROR, error: action.payload };
        case 'RESET_FORM':
            return { ...state, formState: INVITE_STATES.IDLE, error: null };
        case 'SET_INVITATIONS':
            return { ...state, invitations: action.payload };
        case 'REVOKE_SUCCESS':
            return {
                ...state,
                invitations: state.invitations.map(inv =>
                    inv._id === action.payload ? { ...inv, status: 'revoked' } : inv
                ),
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}

const initialState = {
    formState: INVITE_STATES.IDLE,
    invitations: [],
    loading: false,
    error: null,
};

export function useInvitations(docId) {
    const [state, dispatch] = useReducer(inviteReducer, initialState);

    // Fetch existing invitations
    const fetchInvitations = useCallback(async () => {
        if (!docId) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const { data } = await fetchInvitationsAPI(docId);
            dispatch({ type: 'SET_INVITATIONS', payload: data });
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Failed to fetch invitations:', err);
            }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [docId]);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    // Send invitation — asymmetric state loop
    const sendInvitation = useCallback(async (email, role = 'Editor') => {
        if (!docId) return;

        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            dispatch({ type: 'DISPATCH_ERROR', payload: 'Please enter a valid email address' });
            return;
        }

        dispatch({ type: 'START_DISPATCH' });

        try {
            const { data } = await createInvitationAPI({
                email,
                documentId: docId,
                role,
            });
            dispatch({ type: 'DISPATCH_SUCCESS', payload: data });
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to send invitation';
            dispatch({ type: 'DISPATCH_ERROR', payload: message });
            if (process.env.NODE_ENV !== 'production') {
                console.error('Invitation dispatch error:', err);
            }
        }
    }, [docId]);

    // Revoke invitation
    const revokeInvitation = useCallback(async (invitationId) => {
        try {
            await revokeInvitationAPI(invitationId);
            dispatch({ type: 'REVOKE_SUCCESS', payload: invitationId });
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Revoke invitation error:', err);
            }
        }
    }, []);

    // Reset form state
    const resetForm = useCallback(() => {
        dispatch({ type: 'RESET_FORM' });
    }, []);

    return {
        ...state,
        INVITE_STATES,
        sendInvitation,
        revokeInvitation,
        resetForm,
        fetchInvitations,
    };
}
