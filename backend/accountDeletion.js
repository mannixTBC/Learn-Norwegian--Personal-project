const fail = (message, status = 500) => Object.assign(new Error(message), { status });

const deleteUserAccount = async ({ userId, supabase, stripe }) => {
  if (!supabase) throw fail('Ștergerea contului nu este configurată pe server.', 503);

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (customerError) throw fail('Nu am putut verifica abonamentul asociat contului.', 502);

  if (customer?.stripe_customer_id) {
    if (!stripe) throw fail('Abonamentul nu poate fi oprit momentan. Contul nu a fost șters.', 503);
    try {
      await stripe.customers.del(customer.stripe_customer_id);
    } catch (error) {
      if (error?.code !== 'resource_missing') {
        throw fail('Abonamentul nu a putut fi oprit. Contul nu a fost șters.', 502);
      }
    }
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) throw fail('Contul nu a putut fi șters. Încearcă din nou.', 502);
};

module.exports = { deleteUserAccount };
