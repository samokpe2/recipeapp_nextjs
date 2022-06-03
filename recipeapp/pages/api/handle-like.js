import { sanityClient } from "../../lib/sanity";

sanityClient.config({
  token: 'sk2eRmkeWY973v6JqEmRLzqjcHVAoUjtk3bzDDCrkG041MfiC2F5rGgIdIGGKUOkCAWo1T44zAu1lt7swtiE5Qvw09NpzC8Q9gslKknILpeOP1ECVBF2bREnfsenLupp2FE09IeccmO8z4Mw8jKGuKw4C9N3767FjNYa609XWenJpkZy77jO'
});

export default async function likeButtonHandler(req, res) {
  const { _id } = JSON.parse(req.body);
  const data = await sanityClient
    .patch(_id)
    .setIfMissing({ likes: 0 })
    .inc({ likes: 1 })
    .commit()
    .catch((error) => console.log(error));

  res.status(200).json({ likes: data.likes });
}